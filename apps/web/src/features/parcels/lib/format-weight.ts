import BigNumber from 'bignumber.js'

import i18n from '../../../lib/i18n'

export function formatWeightKg(weightKg: number | string): string | null {
  return i18n.t('parcels:weightValue', {
    weight: new BigNumber(weightKg).toFixed(),
  })
}
