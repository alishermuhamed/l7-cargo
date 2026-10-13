import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout } from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'

import { getReadyForPickupBalanceQueryOptions } from '../../../lib/api/queries'
import i18n from '../../../lib/i18n'
import { formatMoneyAmount } from '../../../lib/money'

export function ReadyForPickupBalance() {
  const { data } = useQuery(getReadyForPickupBalanceQueryOptions())

  if (!data || data.totalDeliveryFee === '0') {
    return null
  }

  return (
    <Callout.Root color="amber" size="2">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>

      <Callout.Text>
        {i18n.t('parcels:readyForPickupOwed', {
          amount: formatMoneyAmount(data.totalDeliveryFee, 'KZT'),
        })}
      </Callout.Text>
    </Callout.Root>
  )
}
