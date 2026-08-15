import {
  type ParcelsImportErrorCode,
  type ParcelsImportWarningCode,
} from '../../../lib/api/api.gen'
import i18n from '../../../lib/i18n'

export const PARSE_ERROR_LABELS: Record<ParcelsImportErrorCode, string> = {
  INVALID_CLIENT_ID: i18n.t('parcels:invalidClientCode'),
  INVALID_TRACKING_CODE: i18n.t('parcels:invalidTrackingCode'),
  INVALID_WEIGHT_KG: i18n.t('parcels:invalidWeightKg'),
  INVALID_DELIVERY_FEE: i18n.t('parcels:invalidDeliveryFee'),
  INVALID_NOTES: i18n.t('parcels:invalidNotes'),
  UNKNOWN: i18n.t('parcels:unknownError'),
}

export const PARSE_WARNING_LABELS: Record<ParcelsImportWarningCode, string> = {
  PARCEL_OWNER_MISMATCH: i18n.t('parcels:parcelOwnerMismatch'),
  UNKNOWN_CLIENT: i18n.t('parcels:unknownClient'),
}
