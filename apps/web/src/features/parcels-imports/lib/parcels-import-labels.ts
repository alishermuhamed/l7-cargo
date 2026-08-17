import {
  type ParcelsImportErrorCode,
  type ParcelsImportWarningCode,
} from '../../../lib/api/api.gen'
import i18n from '../../../lib/i18n'

export const PARSE_ERROR_LABELS: Record<ParcelsImportErrorCode, string> = {
  CLIENT_CODE_REQUIRED: i18n.t('parcels:clientCodeRequired'),
  INVALID_CLIENT_ID: i18n.t('parcels:invalidClientCode'),
  INVALID_TRACKING_CODE: i18n.t('parcels:invalidTrackingCode'),
  INVALID_WEIGHT_KG: i18n.t('parcels:invalidWeightKg'),
  INVALID_DELIVERY_FEE: i18n.t('parcels:invalidDeliveryFee'),
  INVALID_COMMENTS: i18n.t('parcels:invalidComments'),
  UNKNOWN: i18n.t('parcels:unknownError'),
}

export const PARSE_WARNING_LABELS: Record<ParcelsImportWarningCode, string> = {
  PARCEL_CLIENT_MISMATCH: i18n.t('parcels:parcelClientMismatch'),
  UNKNOWN_CLIENT: i18n.t('parcels:unknownClient'),
}
