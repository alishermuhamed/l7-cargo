import { Box, Card, Flex, Skeleton, Text } from '@radix-ui/themes'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { useIntersectionObserver } from '../../../hooks/use-intersection-observer'
import { getParcelsImportsInfiniteQueryOptions } from '../../../lib/api/queries'
import { formatDateTime } from '../../../lib/date-time'
import i18n from '../../../lib/i18n'
import { ParcelStatusBadge } from '../../parcels/components/parcel-status-badge'

const PARCELS_IMPORTS_PAGE_SIZE = 10

export function ParcelsImportsCardsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isInitialLoading,
  } = useInfiniteQuery(
    getParcelsImportsInfiniteQueryOptions({
      limit: PARCELS_IMPORTS_PAGE_SIZE,
    })
  )

  const parcelsImports = data?.pages.flatMap((page) => page) ?? []

  const sentinelRef = useIntersectionObserver<HTMLDivElement>({
    enabled: hasNextPage,
    rootMargin: '200px',
    onIntersect: () => {
      if (!isFetchingNextPage) {
        void fetchNextPage()
      }
    },
  })

  return (
    <Flex direction="column" gap="3">
      {parcelsImports.length > 0 &&
        parcelsImports.map((parcelsImport) => (
          <Card key={parcelsImport.id} asChild>
            <Link
              to="/admin/parcels-imports/$parcelsImportId"
              params={{ parcelsImportId: parcelsImport.id }}
            >
              <Flex p="3" direction="column" gap="2">
                <Text as="p" weight="bold">
                  {i18n.t('parcels:createdAt')}:{' '}
                  {formatDateTime(parcelsImport.createdAt)}
                </Text>

                <Box>
                  Parcel status:{' '}
                  <ParcelStatusBadge status={parcelsImport.parcelStatus} />
                </Box>

                <Text as="p">
                  Committed: {parcelsImport.isCommitted ? 'Yes' : 'No'}
                </Text>
              </Flex>
            </Link>
          </Card>
        ))}

      {(isInitialLoading || isFetchingNextPage) && (
        <>
          <Card>
            <Flex p="3" direction="column" gap="3">
              <Skeleton width="150px" height="16px" />
              <Skeleton width="120px" />
              <Skeleton width="90px" />
            </Flex>
          </Card>

          <Card>
            <Flex p="3" direction="column" gap="3">
              <Skeleton width="150px" height="16px" />
              <Skeleton width="120px" />
              <Skeleton width="90px" />
            </Flex>
          </Card>
        </>
      )}

      {!isInitialLoading && parcelsImports.length === 0 && (
        <Card>
          <Flex p="3" align="center" justify="center">
            {i18n.t('parcels:noParcelsImportsFound')}
          </Flex>
        </Card>
      )}

      <Box ref={sentinelRef} aria-hidden="true" height="1px" />
    </Flex>
  )
}
