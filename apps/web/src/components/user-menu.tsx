import {
  DesktopIcon,
  ExitIcon,
  MoonIcon,
  PersonIcon,
  SunIcon,
} from '@radix-ui/react-icons'
import { Avatar, Box, DropdownMenu, Flex, Text } from '@radix-ui/themes'
import { useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useNavigate } from '@tanstack/react-router'

import type { ThemePreference } from '../contexts/theme'
import { useClientContext } from '../hooks/use-client-context'
import { useLocaleContext } from '../hooks/use-locale-context'
import { useSessionContext } from '../hooks/use-session-context'
import { useThemeContext } from '../hooks/use-theme-context'
import { UserRole } from '../lib/api/api.gen'
import { authClient } from '../lib/auth-client'
import i18n, {
  type Language,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
} from '../lib/i18n'
import { formatPhoneNumber } from '../lib/phone-number'
import { IconButton } from './icon-button'

export function UserMenu() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { session } = useSessionContext()
  const { language, setLanguage } = useLocaleContext()
  const { preference, setPreference } = useThemeContext()

  const phoneNumber = formatPhoneNumber(session.user.phoneNumber ?? '')

  const signOut = async () => {
    queryClient.clear()
    await authClient.signOut()
    await navigate({ to: '/auth/sign-in' })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          radius="full"
          aria-label={i18n.t('profile:profile')}
        >
          <Avatar fallback={<PersonIcon width="20px" height="20px" />} />
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end">
        <Box px="2" py="1" minWidth="200px">
          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              {session.user.name}
            </Text>

            <Text size="1" color="gray">
              {phoneNumber}
            </Text>

            {session.user.role === UserRole.client && <ClientCode />}
          </Flex>
        </Box>

        <DropdownMenu.Separator />

        <DropdownMenu.Item asChild>
          <RouterLink to="/profile">{i18n.t('profile:profile')}</RouterLink>
        </DropdownMenu.Item>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            {i18n.t('common:language')}
          </DropdownMenu.SubTrigger>

          <DropdownMenu.SubContent>
            <DropdownMenu.RadioGroup
              value={language}
              onValueChange={(l) => setLanguage(l as Language)}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <DropdownMenu.RadioItem key={l} value={l}>
                  {LANGUAGE_LABELS[l]}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            {i18n.t('common:theme')}
          </DropdownMenu.SubTrigger>

          <DropdownMenu.SubContent>
            <DropdownMenu.RadioGroup
              value={preference}
              onValueChange={(p) => setPreference(p as ThemePreference)}
            >
              <DropdownMenu.RadioItem value="light">
                <SunIcon /> {i18n.t('nav:themeLight')}
              </DropdownMenu.RadioItem>

              <DropdownMenu.RadioItem value="dark">
                <MoonIcon /> {i18n.t('nav:themeDark')}
              </DropdownMenu.RadioItem>

              <DropdownMenu.RadioItem value="system">
                <DesktopIcon /> {i18n.t('nav:themeSystem')}
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />

        <DropdownMenu.Item color="red" onSelect={signOut}>
          <ExitIcon /> {i18n.t('common:signOut')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function ClientCode() {
  const client = useClientContext()

  return (
    <Text size="1" color="gray">
      {i18n.t('profile:clientCode')}: {client.code}
    </Text>
  )
}
