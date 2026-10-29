import { Injectable } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'

import { ParcelStatusHistory } from './entities/parcel-status-history.entity'
import { PARCEL_STATUSES, type ParcelStatus } from './parcel-status'
import { ParcelStatusHistoryRepository } from './parcel-status-history.repository'
import { ParcelsService } from './parcels.service'

@Injectable()
export class ParcelStatusHistoryService {
  constructor(
    private readonly parcelStatusHistoryRepository: ParcelStatusHistoryRepository,
    private readonly parcelsService: ParcelsService
  ) {}

  @Transactional()
  async upsert({
    parcelId,
    status,
    achievedAt,
  }: {
    parcelId: string
    status: ParcelStatus
    achievedAt: string
  }): Promise<void> {
    const history = await this.parcelStatusHistoryRepository.find({
      where: { parcelId },
    })

    const existingEntry = history.find((entry) => entry.status === status)

    if (existingEntry) {
      await this.parcelStatusHistoryRepository.update(
        { id: existingEntry.id },
        { achievedAt }
      )
    } else {
      await this.parcelStatusHistoryRepository.insert(
        this.parcelStatusHistoryRepository.create({
          parcelId,
          status,
          achievedAt,
        })
      )
    }

    await this.refreshParcelStatus(parcelId)
  }

  @Transactional()
  async replace(
    parcelId: string,
    entries: Array<{ status: ParcelStatus; achievedAt: string }>
  ): Promise<void> {
    await this.parcelStatusHistoryRepository.delete({ parcelId })

    const history = entries.map((entry) =>
      this.parcelStatusHistoryRepository.create({ parcelId, ...entry })
    )

    if (history.length > 0) {
      await this.parcelStatusHistoryRepository.insert(history)
    }

    await this.refreshParcelStatus(parcelId)
  }

  async getParcelStatusHistory(
    parcelId: string
  ): Promise<ParcelStatusHistory[]> {
    return this.parcelStatusHistoryRepository.find({
      where: { parcelId },
      order: { createdAt: 'ASC' },
    })
  }

  private async refreshParcelStatus(parcelId: string): Promise<void> {
    const history = await this.parcelStatusHistoryRepository.find({
      where: { parcelId },
    })

    let finalStatus: ParcelStatus | null = null

    for (let index = PARCEL_STATUSES.length - 1; index >= 0; index -= 1) {
      const status = PARCEL_STATUSES[index]

      if (status && history.some((entry) => entry.status === status)) {
        finalStatus = status
        break
      }
    }

    await this.parcelsService.update(parcelId, { status: finalStatus })
  }
}
