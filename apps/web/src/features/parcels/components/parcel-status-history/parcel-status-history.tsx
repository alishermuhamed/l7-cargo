import './parcel-status-history.css'

import { Box, Flex, Heading, Text } from '@radix-ui/themes'
import classNames from 'classnames'

import {
  type GetParcelStatusHistoryResponseDto,
  ParcelStatus,
} from '../../../../lib/api/api.gen'
import { formatDateTime } from '../../../../lib/date-time'
import i18n from '../../../../lib/i18n'
import { PARCEL_STATUS_LABELS } from '../../lib/parcel-status-labels'

interface ParcelStatusHistoryProps {
  history: GetParcelStatusHistoryResponseDto[]
}

export function ParcelStatusHistory({ history }: ParcelStatusHistoryProps) {
  return (
    <Box className="parcel-status-history">
      <Heading size="4">{i18n.t('parcels:statusHistory')}</Heading>

      <ol className="parcel-status-history__timeline">
        {Object.values(ParcelStatus).map((status, index) => {
          const entry = history.find((e) => e.status === status)
          const isDone = entry !== undefined

          return (
            <Flex asChild key={status} gap="3">
              <li>
                <Flex width="20px" direction="column" align="center">
                  <Box
                    width="20px"
                    height="20px"
                    className={classNames(
                      'parcel-status-history__marker',
                      isDone && 'parcel-status-history__marker--done'
                    )}
                  />

                  {index !== Object.keys(ParcelStatus).length - 1 && (
                    <Box
                      width="2px"
                      height="40px"
                      className={classNames(
                        'parcel-status-history__line',
                        isDone && 'parcel-status-history__line--done'
                      )}
                    />
                  )}
                </Flex>

                <Flex mt="-1" direction="column">
                  <Text
                    as="p"
                    weight={isDone ? 'medium' : 'regular'}
                    color={isDone ? undefined : 'gray'}
                  >
                    {PARCEL_STATUS_LABELS[status]}
                  </Text>

                  <Text as="p" color="gray" size="2">
                    {isDone
                      ? formatDateTime(entry.createdAt)
                      : i18n.t('parcels:pendingStatus')}
                  </Text>
                </Flex>
              </li>
            </Flex>
          )
        })}
      </ol>
    </Box>
  )
}
