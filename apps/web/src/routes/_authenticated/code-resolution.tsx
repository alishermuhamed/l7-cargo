import { Button, Card, Container, Flex, Heading, Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { signOut } from '../../lib/api/api.gen'
import { MANAGER_WHATSAPP_URL } from '../../lib/contact'
import i18n from '../../lib/i18n'

export const Route = createFileRoute('/_authenticated/code-resolution')({
  component: CodeResolutionPage,
})

function CodeResolutionPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      window.location.assign('/auth/sign-in')
    } catch {
      toast.error(i18n.t('clients:resolution.signOutFailed'))
      setIsSigningOut(false)
    }
  }

  return (
    <Container size="1" p="4" pt="9">
      <Card size="3">
        <Flex direction="column" gap="4">
          <Heading size="5">{i18n.t('clients:resolution.title')}</Heading>
          <Text>{i18n.t('clients:resolution.description')}</Text>
          <Button asChild>
            <a
              href={MANAGER_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {i18n.t('clients:resolution.contactManager')}
            </a>
          </Button>
          <Button variant="soft" onClick={() => window.location.reload()}>
            {i18n.t('clients:resolution.reload')}
          </Button>
          <Button
            color="gray"
            variant="ghost"
            loading={isSigningOut}
            onClick={handleSignOut}
          >
            {i18n.t('common:signOut')}
          </Button>
        </Flex>
      </Card>
    </Container>
  )
}
