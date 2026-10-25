import { Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { AlertDialog } from '../../../components/alert-dialog'
import { type GetClientResponseDto } from '../../../lib/api/api.gen'
import { ApiError } from '../../../lib/api/custom-fetch'
import i18n from '../../../lib/i18n'
import { useRemoveAliasMutation } from '../hooks/use-remove-alias-mutation'
import { useUpdateClientCode } from '../hooks/use-update-client-code'
import { AddClientAliasDialog } from './add-client-alias-dialog'

export function ManageAlternativeCodesDialog({
  client,
  onClose,
}: {
  client: GetClientResponseDto
  onClose: () => void
}) {
  const [addAliasOpen, setAddAliasOpen] = useState(false)

  const [promoteAlias, setPromoteAlias] = useState<{
    code: number
    expectedCode: number
  } | null>(null)

  const [removeAlias, setRemoveAlias] = useState<number | null>(null)

  const updateCodeMutation = useUpdateClientCode(client.id)

  const removeAliasMutation = useRemoveAliasMutation(client.id)

  const isPending =
    updateCodeMutation.isPending || removeAliasMutation.isPending

  const mutationOptions = {
    onSuccess: () => toast.success(i18n.t('clients:codes.saved')),
    onError: (cause: unknown) => {
      toast.error(
        cause instanceof ApiError && cause.status === 409
          ? i18n.t('clients:codes.conflict')
          : i18n.t('clients:codes.failed')
      )
    },
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
    >
      <Dialog.Content maxWidth="550px">
        <Dialog.Title>{i18n.t('clients:codes.alternatives')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {i18n.t('clients:codes.manageDescription')}
        </Dialog.Description>
        <Flex direction="column" gap="4">
          {client.aliases.length === 0 && (
            <Text size="2" color="gray">
              {i18n.t('clients:codes.empty')}
            </Text>
          )}
          {client.aliases.map((code) => (
            <Flex
              key={code}
              direction={{ initial: 'column', sm: 'row' }}
              align={{ initial: 'start', sm: 'center' }}
              justify="between"
              gap="2"
            >
              <Text weight="medium">{code}</Text>
              <Flex gap="2" wrap="wrap">
                <Button
                  variant="soft"
                  disabled={isPending}
                  onClick={() =>
                    setPromoteAlias({ code, expectedCode: client.code })
                  }
                >
                  {i18n.t('clients:codes.promote')}
                </Button>
                <Button
                  variant="soft"
                  color="red"
                  disabled={isPending}
                  onClick={() => setRemoveAlias(code)}
                >
                  {i18n.t('clients:codes.remove')}
                </Button>
              </Flex>
            </Flex>
          ))}
          <Flex justify="between" gap="3" wrap="wrap">
            <Button
              variant="soft"
              disabled={isPending}
              onClick={() => setAddAliasOpen(true)}
            >
              {i18n.t('clients:codes.add')}
            </Button>
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isPending}>
                {i18n.t('clients:codes.close')}
              </Button>
            </Dialog.Close>
          </Flex>
        </Flex>

        {addAliasOpen && (
          <AddClientAliasDialog
            client={client}
            onClose={() => setAddAliasOpen(false)}
          />
        )}

        {promoteAlias !== null && (
          <AlertDialog
            open
            onOpenChange={(open) => {
              if (!open) setPromoteAlias(null)
            }}
            title={i18n.t('clients:codes.promote')}
            description={`${promoteAlias.code}. ${i18n.t('clients:codes.changeDescription', { code: promoteAlias.expectedCode })}`}
            actionLabel={i18n.t('clients:codes.promote')}
            onAction={() =>
              updateCodeMutation.mutate(promoteAlias, mutationOptions)
            }
          />
        )}

        {removeAlias !== null && (
          <AlertDialog
            open
            onOpenChange={(open) => {
              if (!open) setRemoveAlias(null)
            }}
            title={i18n.t('clients:codes.remove')}
            description={i18n.t('clients:codes.removeDescription', {
              code: removeAlias,
            })}
            actionLabel={i18n.t('clients:codes.remove')}
            actionColor="red"
            onAction={() =>
              removeAliasMutation.mutate(removeAlias, mutationOptions)
            }
          />
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}
