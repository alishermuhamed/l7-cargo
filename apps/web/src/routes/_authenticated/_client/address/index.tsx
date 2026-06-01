import './index.css'

import { Box, Card, Container, Flex, Grid, Text } from '@radix-ui/themes'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'

import { MARKETPLACES } from '../../../../lib/address-marketplaces'
import i18n from '../../../../lib/i18n'

export const Route = createFileRoute('/_authenticated/_client/address/')({
  staticData: {
    title: i18n.t('address:title'),
  },
  component: AddressPage,
})

function AddressPage() {
  return (
    <Container p="4">
      <Grid columns={{ initial: '1', xs: '2', lg: '3' }} gap="4">
        {MARKETPLACES.map((marketplace) => (
          <Card key={marketplace.slug} asChild size="1">
            <RouterLink
              to="/address/$marketplace"
              params={{ marketplace: marketplace.slug }}
            >
              <Flex align="center" gap="4">
                <Box
                  asChild
                  width="100px"
                  height="100px"
                  flexShrink="0"
                  overflow="hidden"
                >
                  <img
                    alt={i18n.t('address:logoAlt', {
                      marketplace: marketplace.name,
                    })}
                    src={marketplace.logoUrl}
                    loading="lazy"
                    className="marketplace-logo"
                  />
                </Box>

                <Text as="p" size="6">
                  {marketplace.name}
                </Text>
              </Flex>
            </RouterLink>
          </Card>
        ))}
      </Grid>
    </Container>
  )
}
