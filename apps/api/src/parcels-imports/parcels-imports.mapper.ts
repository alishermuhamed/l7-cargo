import type { CreateParcelsImportResponseDto } from './dtos/create-parcels-import-response.dto'
import type { GetParcelsImportResponseDto } from './dtos/get-parcels-import-response.dto'
import type { GetParcelsImportSummaryResponseDto } from './dtos/get-parcels-import-summary-response.dto'
import { ParcelsImport } from './entities/parcels-import.entity'

export class ParcelsImportsMapper {
  static toCreateParcelsImportResponseDto(
    id: string
  ): CreateParcelsImportResponseDto {
    return { id }
  }

  static toGetParcelsImportResponseDto(
    parcelsImport: ParcelsImport
  ): GetParcelsImportResponseDto {
    return {
      id: parcelsImport.id,
      isCommitted: parcelsImport.isCommitted,
      parcelStatus: parcelsImport.parcelStatus,
      committedAt: parcelsImport.committedAt?.toISOString() ?? null,
      parsedData: parcelsImport.parsedData,
    }
  }

  static toGetParcelsImportSummaryResponseDto(
    parcelsImport: ParcelsImport
  ): GetParcelsImportSummaryResponseDto {
    return {
      id: parcelsImport.id,
      createdAt: parcelsImport.createdAt.toISOString(),
      parcelStatus: parcelsImport.parcelStatus,
      isCommitted: parcelsImport.isCommitted,
      committedAt: parcelsImport.committedAt?.toISOString() ?? null,
    }
  }
}
