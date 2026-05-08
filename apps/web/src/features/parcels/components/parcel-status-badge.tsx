import { Badge, type BadgeProps } from '@radix-ui/themes'

import { ParcelStatus } from '../../../lib/api/api.gen'
import i18n from '../../../lib/i18n'
import { PARCEL_STATUS_LABELS } from '../lib/parcel-status-labels'

interface ParcelStatusBadgeProps {
  status?: ParcelStatus | null
}

type ParcelStatusBadgeColor = NonNullable<BadgeProps['color']>

const PARCEL_STATUS_BADGE_COLORS: Record<ParcelStatus, ParcelStatusBadgeColor> =
  {
    [ParcelStatus.left_china]: 'amber',
    [ParcelStatus.cleared_customs]: 'sky',
    [ParcelStatus.ready_for_pickup]: 'jade',
    [ParcelStatus.picked_up]: 'gold',
  }

export function ParcelStatusBadge({ status }: ParcelStatusBadgeProps) {
  if (status == null) {
    return <Badge color="gray">{i18n.t('parcels:waiting')}</Badge>
  }

  return (
    <Badge color={PARCEL_STATUS_BADGE_COLORS[status]} radius="full">
      {PARCEL_STATUS_LABELS[status]}
    </Badge>
  )
}
