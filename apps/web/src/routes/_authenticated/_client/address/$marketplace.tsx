import { CopyIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Box,
  Callout,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'
import { createFileRoute, redirect } from '@tanstack/react-router'
import toast from 'react-hot-toast'

import { Button } from '../../../../components/button'
import { CopyButton } from '../../../../components/copy-button'
import { useSessionContext } from '../../../../hooks/use-session-context'
import {
  isMarketplaceSlug,
  MARKETPLACES_BY_SLUGS,
} from '../../../../lib/address-marketplaces'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute(
  '/_authenticated/_client/address/$marketplace'
)({
  staticData: {
    title: i18n.t('address:title'),
    fallbackTo: '/address',
  },
  beforeLoad: ({ params: { marketplace } }) => {
    if (!isMarketplaceSlug(marketplace)) {
      throw redirect({ to: '/address' })
    }

    return { marketplace }
  },
  component: MarketplaceAddressPage,
})

function MarketplaceAddressPage() {
  const { marketplace } = Route.useRouteContext()

  const {
    session: { user },
  } = useSessionContext()

  const marketplaceConfig = MARKETPLACES_BY_SLUGS[marketplace]
  const screenshotUrls = marketplaceConfig.screenshotUrls ?? []
  const marketplaceNote =
    marketplaceConfig.noteKey === 'wechatInvoiceNote'
      ? i18n.t('address:wechatInvoiceNote')
      : null

  const addressLines = marketplaceConfig.formatAddress({
    clientId: user.clientId,
    clientName: user.name,
    phoneNumber: user.phoneNumber,
  })

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(addressLines.join('\n'))
      toast.success(i18n.t('common:copied'))
    } catch {
      toast.error(i18n.t('common:copyFailed'))
    }
  }

  return (
    <Container p="4">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Box asChild flexShrink="0" width="36px" height="36px">
            <img
              alt={i18n.t('address:logoAlt', {
                marketplace: marketplaceConfig.name,
              })}
              loading="lazy"
              src={marketplaceConfig.logoUrl}
            />
          </Box>

          <Heading size="6">{marketplaceConfig.name}</Heading>
        </Flex>

        {marketplaceNote && (
          <Callout.Root color="blue">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>

            <Callout.Text>{marketplaceNote}</Callout.Text>
          </Callout.Root>
        )}

        <Card>
          <Box>
            <Flex direction="column" gap="2">
              {addressLines.map((line, index) => (
                <Flex key={line + index} align="center" gap="4">
                  <Box flexGrow="1">
                    <Text>{line ? line : ' '}</Text>
                  </Box>

                  {line && <CopyButton data={line} />}
                </Flex>
              ))}
            </Flex>
          </Box>
        </Card>

        <Flex direction={{ initial: 'column', xs: 'row' }}>
          <Button onClick={handleCopyAddress}>
            <CopyIcon /> {i18n.t('address:copyFullAddress')}
          </Button>
        </Flex>

        {screenshotUrls.length > 0 && (
          <>
            <Heading size="4" mt="4">
              {i18n.t('address:exampleScreenshotsTitle', {
                marketplace: marketplaceConfig.name,
              })}
            </Heading>

            <Grid columns={{ initial: '1', xs: '2' }} gap="2" align="start">
              {screenshotUrls.map((screenshotUrl, index) => (
                <Card key={screenshotUrl}>
                  <a href={screenshotUrl} target="_blank" rel="noreferrer">
                    <Box asChild width="100%" height="auto">
                      <img
                        alt={i18n.t('address:exampleScreenshotAlt', {
                          index: index + 1,
                          marketplace: marketplaceConfig.name,
                        })}
                        loading="lazy"
                        src={screenshotUrl}
                      />
                    </Box>
                  </a>
                </Card>
              ))}
            </Grid>
          </>
        )}
      </Flex>
    </Container>
  )
}
