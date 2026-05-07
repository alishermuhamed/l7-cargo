import type { ParcelStatus } from '../../../lib/api/api.gen'
import i18n from '../../../lib/i18n'

export const PARCEL_STATUS_LABELS: Record<ParcelStatus, string> = {
  left_china: i18n.t('parcels:statusLeftChina'),
  cleared_customs: i18n.t('parcels:statusClearedCustoms'),
  ready_for_pickup: i18n.t('parcels:statusReadyForPickup'),
  picked_up: i18n.t('parcels:statusPickedUp'),
}
