import { GetParcelStatusHistoryResponseDto } from './dtos/get-parcel-status-history-response.dto'
import { ParcelStatusHistory } from './entities/parcel-status-history.entity'

export class ParcelStatusHistoryMapper {
  static toGetParcelStatusHistoryResponseDto(
    history: ParcelStatusHistory
  ): GetParcelStatusHistoryResponseDto {
    return {
      id: history.id,
      parcelId: history.parcelId,
      createdAt: history.createdAt,
      status: history.status,
    }
  }
}
