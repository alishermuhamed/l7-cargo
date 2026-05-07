import { GetParcelResponseDto } from './dtos/get-parcel-response.dto'
import { Parcel } from './entities/parcel.entity'

export class ParcelsMapper {
  static toGetParcelResponseDto(parcel: Parcel): GetParcelResponseDto {
    return {
      id: parcel.id,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
      trackingNumber: parcel.trackingNumber,
      userId: parcel.userId,
      status: parcel.status,
      source: parcel.source,
      description: parcel.description,
      weightKg: parcel.weightKg,
      deliveryFee: parcel.deliveryFee,
      notes: parcel.notes,
    }
  }
}
