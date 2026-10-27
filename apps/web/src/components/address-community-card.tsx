import { ChatBubbleIcon } from '@radix-ui/react-icons'
import { Button, Callout, Flex, Heading, Link, Text } from '@radix-ui/themes'

import {
  TELEGRAM_CHANNEL_URL,
  WHATSAPP_GROUP_URL,
  WHATSAPP_OVERFLOW_GROUP_URL,
} from '../lib/contact'
import i18n from '../lib/i18n'

export function AddressCommunityCard({
  compact = false,
}: {
  compact?: boolean
}) {
  return (
    <Callout.Root color="blue" size={compact ? '2' : '3'}>
      <Callout.Icon>
        <ChatBubbleIcon />
      </Callout.Icon>

      <Flex direction="column" gap={compact ? '2' : '3'} minWidth="0">
        <Heading as="h2" size={compact ? '3' : '4'}>
          {i18n.t('address:communityTitle')}
        </Heading>

        {!compact && (
          <Text as="p" size="2">
            {i18n.t('address:communityDescription')}
          </Text>
        )}

        <Flex direction={{ initial: 'column', xs: 'row' }} gap="2" wrap="wrap">
          <Button asChild variant="solid" color="green">
            <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
              {i18n.t('address:whatsappGroupLabel')}
            </a>
          </Button>
          <Button asChild variant="soft" color="blue">
            <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noreferrer">
              {i18n.t('address:telegramChannelLabel')}
            </a>
          </Button>
        </Flex>

        <Text as="p" size="2">
          {i18n.t('address:groupFullNotice')}{' '}
          <Link
            href={WHATSAPP_OVERFLOW_GROUP_URL}
            target="_blank"
            rel="noreferrer"
            underline="always"
          >
            {i18n.t('address:secondGroupLabel')}
          </Link>
        </Text>
      </Flex>
    </Callout.Root>
  )
}
