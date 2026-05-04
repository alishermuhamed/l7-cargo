import './drawer.css'

import { Box, VisuallyHidden } from '@radix-ui/themes'
import classNames from 'classnames'
import type { PropsWithChildren } from 'react'
import { Drawer as VaulDrawer } from 'vaul'

import { DRAWER_PORTAL_ROOT_ID } from '../../lib/constants'
import i18n from '../../lib/i18n'

interface DrawerProps extends PropsWithChildren {
  direction?: 'left' | 'right'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  width?: string
  title?: string
  description?: string
}

const DRAWER_BOX_POSITION = {
  left: { left: '0', top: '0', bottom: '0' },
  right: { right: '0', top: '0', bottom: '0' },
} as const

export function Drawer({
  direction = 'left',
  open,
  onOpenChange,
  width,
  title = i18n.t('common:drawerTitle'),
  description = i18n.t('common:drawerDescription'),
  children,
}: DrawerProps) {
  return (
    <VaulDrawer.Root
      direction={direction}
      open={open}
      onOpenChange={onOpenChange}
      handleOnly
    >
      <VaulDrawer.Portal
        container={document.getElementById(DRAWER_PORTAL_ROOT_ID)}
      >
        <VaulDrawer.Overlay asChild>
          <Box position="fixed" inset="0" className="drawer-overlay" />
        </VaulDrawer.Overlay>

        <VaulDrawer.Content asChild>
          <Box
            position="fixed"
            {...DRAWER_BOX_POSITION[direction]}
            maxWidth="90%"
            width={width}
            className={classNames(
              'drawer',
              direction === 'left' && 'drawer-left',
              direction === 'right' && 'drawer-right'
            )}
          >
            <VisuallyHidden>
              <VaulDrawer.Title>{title}</VaulDrawer.Title>

              <VaulDrawer.Description>{description}</VaulDrawer.Description>
            </VisuallyHidden>

            <Box height="100%" overflowY="auto">
              {children}
            </Box>
          </Box>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  )
}
