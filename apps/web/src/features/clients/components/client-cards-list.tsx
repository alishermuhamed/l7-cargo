import { Box, Card, Flex, Skeleton, Text } from '@radix-ui/themes'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { useDebounce } from '../../../hooks/use-debounce'
import { useIntersectionObserver } from '../../../hooks/use-intersection-observer'
import { getClientsInfiniteQueryOptions } from '../../../lib/api/queries'
import i18n from '../../../lib/i18n'
import { formatPhoneNumber } from '../../../lib/phone-number'

const CLIENTS_PAGE_SIZE = 20

interface ClientCardsListProps {
  search: string
}

export function ClientCardsList({ search }: ClientCardsListProps) {
  const debouncedSearch = useDebounce(search, 500)

  const params = {
    limit: CLIENTS_PAGE_SIZE,
    search: debouncedSearch.length === 0 ? undefined : debouncedSearch,
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isInitialLoading,
  } = useInfiniteQuery(getClientsInfiniteQueryOptions(params))

  const clients = data?.pages.flatMap((page) => page) ?? []

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
      {clients.length > 0 &&
        clients.map((client) => (
          <Card key={client.id} asChild>
            <Link
              to="/admin/clients/$clientId"
              params={{ clientId: client.id }}
            >
              <Flex p="3" justify="between" align="center" gap="3">
                <Box minWidth="0">
                  <Text as="p" weight="bold">
                    {client.user?.name ?? '-'}
                  </Text>

                  <Text as="p" color="gray" size="2" truncate>
                    {i18n.t('clients:code')}: {client.code}
                  </Text>

                  <Text as="p" color="gray" size="2" truncate>
                    {formatPhoneNumber(
                      client.user?.phoneNumber ?? client.legacyPhoneRaw ?? ''
                    ) ?? '-'}
                  </Text>
                </Box>
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
            </Flex>
          </Card>

          <Card>
            <Flex p="3" direction="column" gap="3">
              <Skeleton width="150px" height="16px" />
              <Skeleton width="120px" />
            </Flex>
          </Card>
        </>
      )}

      {!isInitialLoading && clients.length === 0 && (
        <Card>
          <Flex p="3" align="center" justify="center">
            {i18n.t('clients:noClientsFound')}
          </Flex>
        </Card>
      )}

      <Box ref={sentinelRef} aria-hidden="true" height="1px" />
    </Flex>
  )
}
