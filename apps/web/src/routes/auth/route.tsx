import { DropdownMenu, Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Button } from '../../components/button'
import { useLocaleContext } from '../../hooks/use-locale-context'
import { authClient } from '../../lib/auth-client'
import {
  type Language,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
} from '../../lib/i18n'

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    const session = await authClient.getSession()

    if (session.data) {
      throw redirect({
        to: '/parcels',
        replace: true,
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const { language, setLanguage } = useLocaleContext()

  return (
    <Flex direction="column" minHeight="100dvh">
      <Flex px="4" py="3" justify="end">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" color="gray">
              {LANGUAGE_LABELS[language]}
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end">
            <DropdownMenu.RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenu.RadioItem key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      <Outlet />
    </Flex>
  )
}
