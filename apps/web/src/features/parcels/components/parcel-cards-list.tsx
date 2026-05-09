import { Box, Card, Flex, Skeleton, Text } from '@radix-ui/themes'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { useDebounce } from '../../../hooks/use-debounce'
import { useIntersectionObserver } from '../../../hooks/use-intersection-observer'
import { type GetParcelsParams, ParcelStatus } from '../../../lib/api/api.gen'
import { getParcelsInfiniteQueryOptions } from '../../../lib/api/queries'
import i18n from '../../../lib/i18n'
import { ParcelStatusBadge } from './parcel-status-badge'

const PARCELS_PAGE_SIZE = 10

interface ParcelCardsListProps {
  search: string
  status?: ParcelStatus
}

export function ParcelCardsList({ search, status }: ParcelCardsListProps) {
  const debouncedSearch = useDebounce(search, 500)

  const params: GetParcelsParams = {
    limit: PARCELS_PAGE_SIZE,
    search: debouncedSearch.length === 0 ? undefined : debouncedSearch,
    status,
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isInitialLoading,
  } = useInfiniteQuery(getParcelsInfiniteQueryOptions(params))

  const parcels = data?.pages.flatMap((page) => page) ?? []

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
      {parcels.length > 0 &&
        parcels.map((p) => (
          <Card key={p.id} asChild>
            <Link to="/parcels/$parcelId" params={{ parcelId: p.id }}>
              <Flex p="2" align="center" justify="between">
                <Box>
                  <Text as="p" weight="bold">
                    {p.trackingNumber}
                  </Text>

                  {p.description && (
                    <Text color="gray" weight="medium" size="2">
                      {p.description}
                    </Text>
                  )}

                  {!p.description && (
                    <Text color="gray" weight="light" size="2">
                      {i18n.t('parcels:noDescription')}
                    </Text>
                  )}
                </Box>

                <ParcelStatusBadge status={p.status} />
              </Flex>
            </Link>
          </Card>
        ))}

      {(isInitialLoading || isFetchingNextPage) && (
        <>
          <Card>
            <Flex p="2" align="center" justify="between">
              <Flex direction="column" gap="3">
                <Skeleton width="150px" height="16px" />
                <Skeleton width="60px" />
              </Flex>

              <Skeleton width="60px" />
            </Flex>
          </Card>

          <Card>
            <Flex p="2" align="center" justify="between">
              <Flex direction="column" gap="3">
                <Skeleton width="150px" height="16px" />
                <Skeleton width="60px" />
              </Flex>

              <Skeleton width="60px" />
            </Flex>
          </Card>
        </>
      )}

      {!isInitialLoading && parcels.length === 0 && (
        <Card>
          <Flex p="3" align="center" justify="center">
            {i18n.t('parcels:noParcelsFound')}
          </Flex>
        </Card>
      )}

      <Box ref={sentinelRef} aria-hidden="true" height="1px" />
    </Flex>
  )
}
