import { type PropsWithChildren, type ReactNode, useLayoutEffect } from 'react'

import type { HeaderConfig } from '../../contexts/header-config'
import { useHeaderConfigContext } from '../../hooks/use-header-config-context'

function HeaderSlot({
  name,
  children,
}: {
  name: keyof HeaderConfig
  children: ReactNode
}) {
  const { setConfig } = useHeaderConfigContext()

  useLayoutEffect(() => {
    setConfig((prev) => ({ ...prev, [name]: children }))

    return () => {
      setConfig((prev) => ({ ...prev, [name]: undefined }))
    }
  }, [name, children, setConfig])

  return null
}

export const HeaderSlots = Object.assign(
  function HeaderSlotsRoot({ children }: PropsWithChildren) {
    return <>{children}</>
  },
  {
    LeftAction: function LeftAction({ children }: PropsWithChildren) {
      return <HeaderSlot name="leftAction">{children}</HeaderSlot>
    },
    Title: function Title({ children }: PropsWithChildren) {
      return <HeaderSlot name="title">{children}</HeaderSlot>
    },
    RightAction: function RightAction({ children }: PropsWithChildren) {
      return <HeaderSlot name="rightAction">{children}</HeaderSlot>
    },
  }
)
