import './parcel-status-history.css'

import { Box, Flex } from '@radix-ui/themes'
import classNames from 'classnames'
import { type PropsWithChildren } from 'react'

export function ParcelStatusHistory({ children }: PropsWithChildren) {
  return (
    <Box asChild p="0" m="0" className="parcel-status-history">
      <ol>{children}</ol>
    </Box>
  )
}

interface ParcelStatusHistoryItemProps extends PropsWithChildren {
  isAchieved: boolean
}

export function ParcelStatusHistoryItem({
  isAchieved,
  children,
}: ParcelStatusHistoryItemProps) {
  return (
    <Flex asChild gap="3">
      <li
        className={classNames(
          'parcel-status-history__item',
          isAchieved && 'parcel-status-history__item--achieved'
        )}
      >
        <Flex direction="column" align="center">
          <Box
            width="20px"
            height="20px"
            className="parcel-status-history__marker"
          />

          <Box
            flexGrow="1"
            width="2px"
            className="parcel-status-history__line"
          />
        </Flex>

        {children}
      </li>
    </Flex>
  )
}
