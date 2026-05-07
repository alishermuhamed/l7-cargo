export const PARCEL_STATUSES = [
  'left_china',
  'cleared_customs',
  'ready_for_pickup',
  'picked_up',
] as const

export type ParcelStatus = (typeof PARCEL_STATUSES)[number]
