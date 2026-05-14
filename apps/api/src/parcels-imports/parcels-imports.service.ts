import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { FindOneOptions, FindOptionsRelations, In } from 'typeorm'
import * as XLSX from 'xlsx'

import { WithRelations } from '../db/db.types'
import { type ParcelStatus } from '../parcels/parcel-status'
import { ParcelStatusHistoryService } from '../parcels/parcel-status-history.service'
import { ParcelsService } from '../parcels/parcels.service'
import { UsersService } from '../users/users.service'
import {
  ParcelsImport,
  PARSE_ERROR_CODES,
  type ParsedParcelsImportData,
  type ParsedParcelsImportError,
  type ParsedParcelsImportRow,
  type ParsedParcelsImportWarning,
  ParseErrorCode,
} from './entities/parcels-import.entity'
import { ParcelsImportsRepository } from './parcels-imports.repository'

@Injectable()
export class ParcelsImportsService {
  private readonly logger = new Logger(ParcelsImportsService.name)

  constructor(
    private readonly parcelsImportsRepository: ParcelsImportsRepository,
    private readonly usersService: UsersService,
    private readonly parcelsService: ParcelsService,
    private readonly parcelStatusHistoryService: ParcelStatusHistoryService
  ) {}

  @Transactional()
  async create({
    file,
    withHeader,
    parcelStatus,
  }: {
    file: Express.Multer.File
    withHeader: boolean
    parcelStatus: ParcelStatus
  }): Promise<ParcelsImport['id']> {
    const parsedData = await this.buildParsedData(file, withHeader)

    const parcelsImport = this.parcelsImportsRepository.create({
      isCommitted: false,
      parcelStatus,
      parsedData,
    })

    await this.parcelsImportsRepository.insert(parcelsImport)

    return parcelsImport.id
  }

  @Transactional()
  async commit(parcelsImportId: string): Promise<void> {
    const parcelsImport = await this.findOneOrThrow({
      where: { id: parcelsImportId },
    })

    if (parcelsImport.isCommitted) {
      throw new ConflictException()
    }

    await this.commitParsedRows(
      parcelsImport.parsedData.rows,
      parcelsImport.parcelStatus
    )

    await this.parcelsImportsRepository.update(
      { id: parcelsImportId },
      {
        isCommitted: true,
        committedAt: new Date(),
      }
    )
  }

  async findOneOrThrow<R extends FindOptionsRelations<ParcelsImport>>(
    options: Omit<FindOneOptions<ParcelsImport>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<ParcelsImport, R>> {
    return this.parcelsImportsRepository.findOneOrThrow(options)
  }

  private async buildParsedData(
    file: Express.Multer.File,
    withHeader: boolean
  ): Promise<ParsedParcelsImportData> {
    const { rows, errors } = this.parseFile(file, withHeader)
    const warnings = await this.buildWarnings(rows)

    return { rows, warnings, errors }
  }

  private parseFile(
    file: Express.Multer.File,
    withHeader: boolean
  ): { rows: ParsedParcelsImportRow[]; errors: ParsedParcelsImportError[] } {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]

      if (!sheetName) {
        this.logger.error('XSLX file has no sheets')
        throw new BadRequestException()
      }

      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        blankrows: false,
      })

      const dataRows = withHeader ? rawRows.slice(1) : rawRows

      const rows: ParsedParcelsImportRow[] = []
      const errors: ParsedParcelsImportError[] = []

      dataRows.forEach((row, index) => {
        const rowNumber = index + 1 + (withHeader ? 1 : 0)

        if (!Array.isArray(row)) {
          errors.push({ rowNumber, code: 'UNKNOWN' })
          return
        }

        try {
          const clientId = this.parseClientId(row[1])
          const trackingNumber = this.parseTrackingNumber(row[2])
          const weightKg = this.parseWeightKg(row[3])
          const deliveryFee = this.parseDeliveryFee(row[4])
          const notes = this.parseNotes(row[5])

          rows.push({
            rowNumber,
            clientId,
            trackingNumber,
            weightKg,
            deliveryFee,
            notes,
          })
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e)
          const code =
            PARSE_ERROR_CODES.find((code) => code === errorMessage) ?? 'UNKNOWN'

          errors.push({
            rowNumber,
            code,
          })
        }
      })

      return { rows, errors }
    } catch (e: unknown) {
      this.logger.error(
        'XLSX file parsing failed',
        e instanceof Error ? (e.stack ?? e.message) : String(e)
      )

      throw new BadRequestException()
    }
  }

  private parseClientId(cell: unknown): number {
    if (typeof cell !== 'number' || !Number.isInteger(cell)) {
      throw new Error('INVALID_CLIENT_ID' satisfies ParseErrorCode)
    }

    return cell
  }

  private parseTrackingNumber(cell: unknown): string {
    if (
      (typeof cell !== 'number' || !Number.isInteger(cell)) &&
      (typeof cell !== 'string' || cell === '')
    ) {
      throw new Error('INVALID_TRACKING_CODE' satisfies ParseErrorCode)
    }

    return cell.toString().trim()
  }

  private parseWeightKg(cell: unknown): number | undefined {
    if (cell === undefined || cell === '') {
      return undefined
    }

    if (typeof cell !== 'number' || Number.isNaN(cell)) {
      throw new Error('INVALID_WEIGHT_KG' satisfies ParseErrorCode)
    }

    return Math.round(cell * 1000) / 1000
  }

  private parseDeliveryFee(cell: unknown): number | undefined {
    if (cell === undefined || cell === '') {
      return undefined
    }

    if (typeof cell !== 'number' || Number.isNaN(cell)) {
      throw new Error('INVALID_DELIVERY_FEE' satisfies ParseErrorCode)
    }

    return cell
  }

  private parseNotes(cell: unknown): string | undefined {
    if (cell === undefined || cell === '') {
      return undefined
    }

    if (typeof cell !== 'string') {
      throw new Error('INVALID_NOTES' satisfies ParseErrorCode)
    }

    return cell.trim()
  }

  private async buildWarnings(
    rows: ParsedParcelsImportRow[]
  ): Promise<ParsedParcelsImportWarning[]> {
    const { existingUsersByIds, existingParcelsByTrackingNumbers } =
      await this.loadExistingData(rows)

    const warnings: ParsedParcelsImportWarning[] = []

    rows.forEach((row) => {
      const existingParcel = existingParcelsByTrackingNumbers.get(
        row.trackingNumber
      )

      if (existingParcel?.userId) {
        const existingUser = existingUsersByIds.get(existingParcel.userId)

        if (existingUser && existingUser.clientId !== row.clientId) {
          warnings.push({
            rowNumber: row.rowNumber,
            code: 'PARCEL_OWNER_MISMATCH',
          })
        }
      }
    })

    return warnings
  }

  private async commitParsedRows(
    rows: ParsedParcelsImportRow[],
    parcelStatus: ParcelStatus
  ): Promise<void> {
    const { existingUsersByClientIds, existingParcelsByTrackingNumbers } =
      await this.loadExistingData(rows)

    for (const row of rows) {
      const existingParcel = existingParcelsByTrackingNumbers.get(
        row.trackingNumber
      )

      const matchingUser = existingUsersByClientIds.get(row.clientId) ?? null

      if (existingParcel) {
        const userId = existingParcel.userId ?? matchingUser?.id ?? null

        await this.parcelsService.update(existingParcel.id, {
          userId,
          status: parcelStatus,
          weightKg: row.weightKg?.toFixed(3),
          deliveryFee: row.deliveryFee?.toFixed(),
          notes: row.notes,
        })

        await this.parcelStatusHistoryService.create({
          parcelId: existingParcel.id,
          status: parcelStatus,
        })
      } else {
        const createdParcelId = await this.parcelsService.create({
          trackingNumber: row.trackingNumber,
          userId: matchingUser?.id ?? null,
          status: parcelStatus,
          weightKg: row.weightKg?.toFixed(3),
          deliveryFee: row.deliveryFee?.toFixed(),
          notes: row.notes,
        })

        await this.parcelStatusHistoryService.create({
          parcelId: createdParcelId,
          status: parcelStatus,
        })
      }
    }
  }

  private async loadExistingData(rows: ParsedParcelsImportRow[]): Promise<{
    existingUsersByIds: Map<string, { id: string; clientId: number }>
    existingUsersByClientIds: Map<number, { id: string; clientId: number }>
    existingParcelsByTrackingNumbers: Map<
      string,
      { id: string; userId: string | null }
    >
  }> {
    const clientIdsSet = new Set<number>()
    const trackingNumbersSet = new Set<string>()

    rows.forEach((row) => {
      clientIdsSet.add(row.clientId)
      trackingNumbersSet.add(row.trackingNumber)
    })

    const clientIds = [...clientIdsSet]
    const trackingNumbers = [...trackingNumbersSet]

    const [existingParcels, users] = await Promise.all([
      trackingNumbers.length
        ? this.parcelsService.find({
            where: { trackingNumber: In(trackingNumbers) },
          })
        : Promise.resolve([]),
      clientIds.length
        ? this.usersService.find({ where: { clientId: In(clientIds) } })
        : Promise.resolve([]),
    ])

    return {
      existingUsersByIds: new Map(users.map((user) => [user.id, user])),
      existingUsersByClientIds: new Map(
        users.map((user) => [user.clientId, user])
      ),
      existingParcelsByTrackingNumbers: new Map(
        existingParcels.map((parcel) => [parcel.trackingNumber, parcel])
      ),
    }
  }
}
