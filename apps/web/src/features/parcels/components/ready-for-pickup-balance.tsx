import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'

import { ParcelStatus } from '../../../lib/api/api.gen'
import { getParcelsQueryOptions } from '../../../lib/api/queries'
import i18n from '../../../lib/i18n'
import { addMoneyAmounts, formatMoneyAmount } from '../../../lib/money'

export function ReadyForPickupBalance() {
  const { data: parcels = [] } = useQuery(
    getParcelsQueryOptions({ status: ParcelStatus.ready_for_pickup })
  )

  const deliveryFees = parcels
    .map((parcel) => parcel.deliveryFee)
    .filter((deliveryFee): deliveryFee is string => deliveryFee !== null)

  if (deliveryFees.length === 0) {
    return null
  }

  const totalDeliveryFee = addMoneyAmounts(deliveryFees)

  return (
    <Callout.Root color="amber" size="2">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>

      <Callout.Text>
        {i18n.t('parcels:readyForPickupOwed', {
          amount: formatMoneyAmount(totalDeliveryFee, 'KZT'),
        })}
      </Callout.Text>
    </Callout.Root>
  )
}
