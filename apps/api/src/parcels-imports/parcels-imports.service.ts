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
    const { rows, errors: parseErrors } = this.parseFile(file, withHeader)
    const { warnings, errors: validationErrors } = await this.buildIssues(rows)

    return {
      rows,
      warnings,
      errors: [...parseErrors, ...validationErrors].sort(
        (a, b) => a.rowNumber - b.rowNumber
      ),
    }
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
          const trackingNumber = this.parseTrackingNumber(row[0])
          const clientCode = this.parseClientCode(row[1])
          const weightKg = this.parseWeightKg(row[2])
          const deliveryFee = this.parseDeliveryFee(row[3])
          const comments = this.parseComments(row[4])

          rows.push({
            rowNumber,
            clientCode,
            trackingNumber,
            weightKg,
            deliveryFee,
            comments,
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

  private parseTrackingNumber(cell: unknown): string {
    const isValidNumber = typeof cell === 'number' && Number.isInteger(cell)
    const isValidString = typeof cell === 'string' && cell.trim() !== ''

    if (!isValidNumber && !isValidString) {
      throw new Error('INVALID_TRACKING_CODE' satisfies ParseErrorCode)
    }

    return cell.toString().trim()
  }

  private parseClientCode(cell: unknown): number | undefined {
    if (
      cell === undefined ||
      cell === '' ||
      (typeof cell === 'string' && cell.trim() === '')
    ) {
      return undefined
    }

    const clientCode = typeof cell === 'string' ? Number(cell.trim()) : cell

    if (
      typeof clientCode !== 'number' ||
      !Number.isInteger(clientCode) ||
      clientCode < 1
    ) {
      throw new Error('INVALID_CLIENT_ID' satisfies ParseErrorCode)
    }

    return clientCode
  }

  private parseWeightKg(cell: unknown): number | undefined {
    if (cell === undefined || cell === '') {
      return undefined
    }

    let weightKg: number

    if (typeof cell === 'number') {
      weightKg = cell
    } else if (typeof cell === 'string') {
      weightKg = Number(cell.trim().replace(',', '.'))
    } else {
      throw new Error('INVALID_WEIGHT_KG' satisfies ParseErrorCode)
    }

    if (!Number.isFinite(weightKg)) {
      throw new Error('INVALID_WEIGHT_KG' satisfies ParseErrorCode)
    }

    return Math.round(weightKg * 1000) / 1000
  }

  private parseDeliveryFee(cell: unknown): number | undefined {
    if (
      cell === undefined ||
      cell === '' ||
      (typeof cell === 'string' && cell.trim() === '')
    ) {
      return undefined
    }

    const deliveryFee = typeof cell === 'string' ? Number(cell.trim()) : cell

    if (typeof deliveryFee !== 'number' || !Number.isFinite(deliveryFee)) {
      throw new Error('INVALID_DELIVERY_FEE' satisfies ParseErrorCode)
    }

    return deliveryFee
  }

  private parseComments(cell: unknown): string | undefined {
    if (cell === undefined || cell === '') {
      return undefined
    }

    if (typeof cell !== 'string') {
      throw new Error('INVALID_COMMENTS' satisfies ParseErrorCode)
    }

    return cell.trim()
  }

  private async buildIssues(rows: ParsedParcelsImportRow[]): Promise<{
    warnings: ParsedParcelsImportWarning[]
    errors: ParsedParcelsImportError[]
  }> {
    const { existingClientsByCodes, existingParcelsByTrackingNumbers } =
      await this.loadExistingData(rows)

    const warnings: ParsedParcelsImportWarning[] = []
    const errors: ParsedParcelsImportError[] = []

    rows.forEach((row) => {
      const existingParcel = existingParcelsByTrackingNumbers.get(
        row.trackingNumber
      )

      if (row.clientCode === undefined) {
        if (!existingParcel) {
          errors.push({
            rowNumber: row.rowNumber,
            code: 'CLIENT_CODE_REQUIRED',
          })
        }

        return
      }

      const matchingClient = existingClientsByCodes.get(row.clientCode)

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

    return { warnings, errors }
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

      if (existingParcel) {
        await this.parcelsService.update(existingParcel.id, {
          weightKg: row.weightKg?.toFixed(3),
          deliveryFee: row.deliveryFee?.toFixed(),
          comments: row.comments,
        })

        await this.parcelStatusHistoryService.upsert({
          parcelId: existingParcel.id,
          status: parcelStatus,
          achievedAt,
        })

        continue
      }

      if (row.clientCode === undefined) {
        continue
      }

      let matchingClient = existingClientsByCodes.get(row.clientCode)

      if (!matchingClient) {
        matchingClient = await this.clientsService.findOrCreateByCode(
          row.clientCode
        )

        existingClientsByCodes.set(row.clientCode, matchingClient)
      }

      const parcelId = await this.parcelsService.create({
        trackingNumber: row.trackingNumber,
        clientId: matchingClient.id,
        weightKg: row.weightKg?.toFixed(3),
        deliveryFee: row.deliveryFee?.toFixed(),
        comments: row.comments,
      })

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
      if (row.clientCode !== undefined) {
        clientCodesSet.add(row.clientCode)
      }

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
