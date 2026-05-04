import { type PropsWithChildren, useState } from 'react'

import {
  DEFAULT_HEADER_CONFIG,
  type HeaderConfig,
  HeaderConfigContext,
} from '../contexts/header-config'

export function HeaderConfigContextProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG)

  const resetConfig = () => setConfig(DEFAULT_HEADER_CONFIG)

  return (
    <HeaderConfigContext.Provider value={{ config, setConfig, resetConfig }}>
      {children}
    </HeaderConfigContext.Provider>
  )
}
