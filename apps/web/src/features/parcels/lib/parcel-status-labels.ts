import type { ParcelStatus } from '../../../lib/api/api.gen'

export const PARCEL_STATUS_LABELS: Record<ParcelStatus, string> = {
  left_china: 'Left China',
  cleared_customs: 'Cleared Customs',
  ready_for_pickup: 'Ready for Pickup',
  picked_up: 'Picked up',
}
