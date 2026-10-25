import './index.css'

import { ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'

import { MARKETPLACES_BY_SLUGS } from '../../../../lib/address-marketplaces'
import i18n from '../../../../lib/i18n'

const TRAINING_LINKS = [
  {
    href: 'https://t.me/+R8F547v6ZmY1Yjli',
    logoUrl: MARKETPLACES_BY_SLUGS.pinduoduo.logoUrl,
    titleKey: 'pinduoduo',
    sourceKey: 'telegramChannel',
  },
  {
    href: 'https://t.me/+nirkFjw7hsw2M2I6',
    logoUrl: MARKETPLACES_BY_SLUGS.poizon.logoUrl,
    titleKey: 'poizon',
    sourceKey: 'telegramChannel',
  },
  {
    href: 'https://t.me/+QLfFpQKMaJ4wNjMy',
    logoUrl: MARKETPLACES_BY_SLUGS.wechat.logoUrl,
    titleKey: 'wechat',
    sourceKey: 'telegramChannel',
  },
  {
    href: 'https://t.me/+cTgddORUD38zNDYy',
    logoUrl: MARKETPLACES_BY_SLUGS.taobao.logoUrl,
    titleKey: 'taobao',
    sourceKey: 'telegramChannel',
  },
  {
    href: 'https://youtu.be/FFOCbPiBf5c',
    logoUrl: MARKETPLACES_BY_SLUGS['1688'].logoUrl,
    titleKey: '1688',
    sourceKey: 'youtube',
  },
] as const

export const Route = createFileRoute('/_authenticated/_client/training/')({
  staticData: {
    title: i18n.t('training:title'),
  },
  component: TrainingPage,
})

function TrainingPage() {
  return (
    <Container p="4">
      <Flex direction="column" gap="6">
        <Box maxWidth="680px">
          <Heading as="h1" size={{ initial: '7', sm: '8' }} mb="2">
            {i18n.t('training:heading')}
          </Heading>

          <Text as="p" size={{ initial: '3', sm: '4' }} color="gray">
            {i18n.t('training:description')}
          </Text>
        </Box>

        <Grid columns={{ initial: '1', xs: '2', lg: '3' }} gap="4">
          {TRAINING_LINKS.map((trainingLink) => {
            const title = i18n.t(`training:${trainingLink.titleKey}`)

            return (
              <Card key={trainingLink.href} asChild size="1">
                <a href={trainingLink.href} target="_blank" rel="noreferrer">
                  <Flex direction="column" gap="4">
                    <Flex align="start" justify="between" gap="3">
                      <Box
                        asChild
                        width="64px"
                        height="64px"
                        flexShrink="0"
                        overflow="hidden"
                      >
                        <img
                          className="course-logo"
                          src={trainingLink.logoUrl}
                          alt={i18n.t('training:logoAlt', {
                            marketplace: title,
                          })}
                          loading="lazy"
                        />
                      </Box>

                      <ExternalLinkIcon width="20" height="20" />
                    </Flex>

                    <Flex direction="column" gap="1">
                      <Heading as="h2" size="5">
                        {title}
                      </Heading>

                      <Text as="p" size="2" color="gray">
                        {i18n.t(`training:${trainingLink.sourceKey}`)}
                      </Text>
                    </Flex>
                  </Flex>
                </a>
              </Card>
            )
          })}
        </Grid>
      </Flex>
    </Container>
  )
}
