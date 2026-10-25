import { Box, Card, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '../../../components/button'
import { useDebounce } from '../../../hooks/use-debounce'
import {
  findMergeCandidates,
  type GetClientResponseDto,
  type MergeCandidateResponseDto,
  mergeClients,
  previewClientMerge,
} from '../../../lib/api/api.gen'
import { ApiError } from '../../../lib/api/custom-fetch'
import { clientsKeys } from '../../../lib/api/queries'
import { formatClientCode } from '../../../lib/client-code'
import i18n from '../../../lib/i18n'
import { formatPhoneNumber } from '../../../lib/phone-number'

function mergeError(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data
    if (typeof data === 'object' && data !== null && 'message' in data) {
      if (data.message === 'CLIENT_MERGE_REVIEW_REQUIRED')
        return i18n.t('clients:merge.reviewRequired')
      if (data.message === 'CLIENT_MERGE_CHANGED')
        return i18n.t('clients:merge.changed')
    }
    if (error.status === 404) return i18n.t('clients:merge.notFound')
  }
  return i18n.t('clients:merge.failed')
}

function CandidateDetails({ client }: { client: MergeCandidateResponseDto }) {
  return (
    <Flex direction="column" gap="1">
      <Text weight="bold">
        {i18n.t('clients:code')} - {formatClientCode(client.code)}
      </Text>
      <Text size="2">
        {i18n.t('clients:aliases')} -{' '}
        {client.aliases.map(formatClientCode).join(', ') || '—'}
      </Text>
      <Text size="2">
        {i18n.t('profile:name')} - {client.name || '—'}
      </Text>
      <Text size="2">
        {i18n.t('auth:phoneNumber')} -{' '}
        {formatPhoneNumber(client.phone ?? '') || client.phone || '—'}
      </Text>
      <Text size="2">
        {i18n.t('parcels:parcels')} - {client.parcelCount}
      </Text>
    </Flex>
  )
}

export function MergeClientsDialog({
  client,
  onClose,
}: {
  client: GetClientResponseDto
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<MergeCandidateResponseDto | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const submitting = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const debouncedSearch = useDebounce(search.trim(), 250)
  const code = Number(debouncedSearch)
  const validCode =
    /^-?\d+$/.test(debouncedSearch) &&
    Number.isInteger(code) &&
    code !== 0 &&
    code >= -2147483648 &&
    code <= 2147483647
  const candidates = useQuery({
    queryKey: [...clientsKeys.all, 'merge-candidates', client.id, code],
    queryFn: ({ signal }) =>
      findMergeCandidates(client.id, { code }, { signal }),
    enabled: !selected && validCode,
    staleTime: 0,
  })
  const sourceId = selected?.id ?? ''
  const preview = useQuery({
    queryKey: [...clientsKeys.all, 'merge-preview', client.id, sourceId],
    queryFn: ({ signal }) =>
      previewClientMerge(client.id, { sourceId }, { signal }),
    enabled: Boolean(selected),
    staleTime: 0,
    retry: false,
  })
  const mutation = useMutation({
    mutationFn: (version: string) =>
      mergeClients(client.id, { sourceId, version }),
  })
  const pending = mutation.isPending
  const searching = search.trim() !== debouncedSearch || candidates.isFetching
  const submit = async () => {
    if (
      !selected ||
      !preview.data ||
      preview.isFetching ||
      preview.isError ||
      submitting.current
    )
      return
    submitting.current = true
    setError(null)
    try {
      await mutation.mutateAsync(preview.data.version)
      toast.success(i18n.t('clients:merge.saved'))
      onClose()
    } catch (cause: unknown) {
      setError(mergeError(cause))
      await preview.refetch()
    } finally {
      submitting.current = false
    }
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !submitting.current) onClose()
      }}
    >
      <Dialog.Content
        maxWidth="490px"
        onEscapeKeyDown={(event) => {
          if (submitting.current) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (submitting.current) event.preventDefault()
        }}
      >
        <Dialog.Title>{i18n.t('clients:merge.title')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {i18n.t('clients:code')} {formatClientCode(client.code)}
          {client.user?.name ? ` · ${client.user.name}` : ''}
        </Dialog.Description>
        <Flex direction="column" gap="3">
          {selected ? (
            <>
              <Text size="2" weight="bold">
                {i18n.t('clients:merge.selected')}
              </Text>
              <Card>
                <Flex direction="column" gap="2">
                  <CandidateDetails client={selected} />
                  <Box>
                    <Button
                      variant="ghost"
                      disabled={pending}
                      onClick={() => {
                        setSelected(null)
                        setError(null)
                        requestAnimationFrame(() => input.current?.focus())
                      }}
                    >
                      {i18n.t('clients:merge.change')}
                    </Button>
                  </Box>
                </Flex>
              </Card>
              {preview.isFetching && (
                <Text size="2" role="status">
                  {i18n.t('clients:merge.loading')}
                </Text>
              )}
              {preview.isError && (
                <Text color="red" size="2" role="alert">
                  {mergeError(preview.error)}
                </Text>
              )}
              {preview.data && !preview.isError && !preview.isFetching && (
                <Box aria-live="polite">
                  <Text>{i18n.t('clients:merge.after')}</Text>
                  <Box asChild mt="2" pl="5">
                    <ul>
                      <li>
                        {i18n.t('clients:codes.primary')} -{' '}
                        <strong>{formatClientCode(preview.data.code)}</strong>
                      </li>
                      <li>
                        {i18n.t('clients:aliases')} -{' '}
                        <strong>
                          {preview.data.aliases
                            .map(formatClientCode)
                            .join(', ') || '—'}
                        </strong>
                      </li>
                      <li>
                        {i18n.t('parcels:parcels')} -{' '}
                        <strong>{preview.data.parcelCount}</strong>
                      </li>
                      <li>
                        {i18n.t('profile:name')} -{' '}
                        <strong>{preview.data.name || '—'}</strong>
                      </li>
                      <li>
                        {i18n.t('auth:phoneNumber')} -{' '}
                        <strong>
                          {formatPhoneNumber(preview.data.phone ?? '') ||
                            preview.data.phone ||
                            '—'}
                        </strong>
                      </li>
                    </ul>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <>
              <label>
                <Text as="div" size="2" weight="bold" mb="2">
                  {i18n.t('clients:merge.search')}
                </Text>
                <TextField.Root
                  ref={input}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={i18n.t('clients:merge.placeholder')}
                  inputMode="text"
                  autoComplete="off"
                  autoFocus
                />
              </label>
              {searching && validCode && (
                <Text size="2" role="status">
                  {i18n.t('clients:merge.loading')}
                </Text>
              )}
              {search.trim() && !searching && !validCode && (
                <Text size="2" color="red">
                  {i18n.t('clients:merge.invalidCode')}
                </Text>
              )}
              {!searching && validCode && candidates.isError && (
                <Text size="2" color="red" role="alert">
                  {i18n.t('clients:merge.searchFailed')}
                </Text>
              )}
              {!searching && validCode && candidates.isSuccess && (
                <Flex
                  direction="column"
                  gap="2"
                  aria-label={i18n.t('clients:merge.results')}
                >
                  {candidates.data.length === 0 && (
                    <Text size="2" role="status">
                      {i18n.t('clients:noClientsFound')}
                    </Text>
                  )}
                  {candidates.data.map((candidate) => (
                    <Card key={candidate.id} asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(candidate)
                          setError(null)
                        }}
                      >
                        <CandidateDetails client={candidate} />
                      </button>
                    </Card>
                  ))}
                </Flex>
              )}
            </>
          )}
          {error && (
            <Text size="2" color="red" role="alert">
              {error}
            </Text>
          )}
          <Flex gap="3" mt="2" justify="end" wrap="wrap">
            <Button
              variant="soft"
              color="gray"
              disabled={pending}
              onClick={onClose}
            >
              {i18n.t('common:cancel')}
            </Button>
            <Button
              loading={pending}
              disabled={
                !selected ||
                !preview.data ||
                preview.isFetching ||
                preview.isError
              }
              onClick={() => void submit()}
            >
              {i18n.t('clients:merge.submit')}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
