import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  In,
} from 'typeorm'
import * as XLSX from 'xlsx'

import { ClientsService } from '../clients/clients.service'
import { WithRelations } from '../db/db.types'
import { type ParcelStatus } from '../parcels/parcel-status'
import { ParcelStatusHistoryService } from '../parcels/parcel-status-history.service'
import { ParcelsService } from '../parcels/parcels.service'
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
    private readonly clientsService: ClientsService,
    private readonly parcelsService: ParcelsService,
    private readonly parcelStatusHistoryService: ParcelStatusHistoryService
  ) {}

  @Transactional()
  async create({
    file,
    withHeader,
    parcelStatus,
    achievedAt,
  }: {
    file: Express.Multer.File
    withHeader: boolean
    parcelStatus: ParcelStatus
    achievedAt: string
  }): Promise<ParcelsImport['id']> {
    const parsedData = await this.buildParsedData(file, withHeader)

    const parcelsImport = this.parcelsImportsRepository.create({
      isCommitted: false,
      parcelStatus,
      achievedAt,
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
      parcelsImport.parcelStatus,
      parcelsImport.achievedAt
    )

    await this.parcelsImportsRepository.update(
      { id: parcelsImportId },
      {
        isCommitted: true,
        committedAt: new Date(),
      }
    )
  }

  async find<R extends FindOptionsRelations<ParcelsImport>>(
    options?: Omit<FindManyOptions<ParcelsImport>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<ParcelsImport, R>[]> {
    return this.parcelsImportsRepository.find(options)
  }

  async findOneOrThrow<R extends FindOptionsRelations<ParcelsImport>>(
    options: Omit<FindOneOptions<ParcelsImport>, 'relations'> & {
      relations?: R
    }
  ): Promise<WithRelations<ParcelsImport, R>> {
    return this.parcelsImportsRepository.findOneOrThrow(options)
  }

  async delete(parcelsImportId: string): Promise<void> {
    const parcelsImport = await this.findOneOrThrow({
      where: { id: parcelsImportId },
    })

    if (parcelsImport.isCommitted) {
      throw new BadRequestException()
    }

    await this.parcelsImportsRepository.delete({ id: parcelsImport.id })
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
          const clientCode = this.parseClientCode(row[0])
          const trackingNumber = this.parseTrackingNumber(row[1])
          const weightKg = this.parseWeightKg(row[2])
          const deliveryFee = this.parseDeliveryFee(row[3])
          const notes = this.parseNotes(row[4])

          rows.push({
            rowNumber,
            clientCode,
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

  private parseClientCode(cell: unknown): number {
    if (typeof cell !== 'number' || !Number.isInteger(cell) || cell < 1) {
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
    const { existingClientsByCodes, existingParcelsByTrackingNumbers } =
      await this.loadExistingData(rows)

    const warnings: ParsedParcelsImportWarning[] = []

    rows.forEach((row) => {
      const matchingClient = existingClientsByCodes.get(row.clientCode)
      const existingParcel = existingParcelsByTrackingNumbers.get(
        row.trackingNumber
      )

      if (!matchingClient) {
        warnings.push({
          rowNumber: row.rowNumber,
          code: 'UNKNOWN_CLIENT',
        })
      }

      if (existingParcel && existingParcel.client.code !== row.clientCode) {
        warnings.push({
          rowNumber: row.rowNumber,
          code: 'PARCEL_CLIENT_MISMATCH',
        })
      }
    })

    return warnings
  }

  private async commitParsedRows(
    rows: ParsedParcelsImportRow[],
    parcelStatus: ParcelStatus,
    achievedAt: string
  ): Promise<void> {
    const { existingClientsByCodes, existingParcelsByTrackingNumbers } =
      await this.loadExistingData(rows)

    for (const row of rows) {
      const existingParcel = existingParcelsByTrackingNumbers.get(
        row.trackingNumber
      )

      let matchingClient = existingClientsByCodes.get(row.clientCode)

      if (!matchingClient) {
        matchingClient = await this.clientsService.findOrCreateByCode(
          row.clientCode
        )
        existingClientsByCodes.set(row.clientCode, matchingClient)
      }

      let parcelId: string

      if (existingParcel) {
        parcelId = existingParcel.id

        await this.parcelsService.update(parcelId, {
          weightKg: row.weightKg?.toFixed(3),
          deliveryFee: row.deliveryFee?.toFixed(),
          notes: row.notes,
        })
      } else {
        parcelId = await this.parcelsService.create({
          trackingNumber: row.trackingNumber,
          clientId: matchingClient.id,
          weightKg: row.weightKg?.toFixed(3),
          deliveryFee: row.deliveryFee?.toFixed(),
          notes: row.notes,
        })
      }

      await this.parcelStatusHistoryService.upsert({
        parcelId,
        status: parcelStatus,
        achievedAt,
      })
    }
  }

  private async loadExistingData(rows: ParsedParcelsImportRow[]): Promise<{
    existingClientsByCodes: Map<number, { id: string; code: number }>
    existingParcelsByTrackingNumbers: Map<
      string,
      { id: string; clientId: string; client: { code: number } }
    >
  }> {
    const clientCodesSet = new Set<number>()
    const trackingNumbersSet = new Set<string>()

    rows.forEach((row) => {
      clientCodesSet.add(row.clientCode)
      trackingNumbersSet.add(row.trackingNumber)
    })

    const clientCodes = [...clientCodesSet]
    const trackingNumbers = [...trackingNumbersSet]

    const [existingParcels, clients] = await Promise.all([
      trackingNumbers.length
        ? this.parcelsService.find({
            where: { trackingNumber: In(trackingNumbers) },
            relations: { client: true },
          })
        : Promise.resolve([]),
      clientCodes.length
        ? this.clientsService.find({ where: { code: In(clientCodes) } })
        : Promise.resolve([]),
    ])

    return {
      existingClientsByCodes: new Map(
        clients.map((client) => [client.code, client])
      ),
      existingParcelsByTrackingNumbers: new Map(
        existingParcels.map((parcel) => [parcel.trackingNumber, parcel])
      ),
    }
  }
}
