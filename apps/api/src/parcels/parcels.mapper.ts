import { CreateParcelResponseDto } from './dtos/create-parcel-response.dto'
import { GetParcelResponseDto } from './dtos/get-parcel-response.dto'
import { Parcel } from './entities/parcel.entity'

export class ParcelsMapper {
  static toCreateParcelResponseDto(id: string): CreateParcelResponseDto {
    return { id }
  }

  static toGetParcelResponseDto(parcel: Parcel): GetParcelResponseDto {
    return {
      id: parcel.id,
      createdAt: parcel.createdAt.toISOString(),
      updatedAt: parcel.updatedAt.toISOString(),
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
