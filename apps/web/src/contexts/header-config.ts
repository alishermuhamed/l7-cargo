import React, { createContext, type ReactNode } from 'react'

export interface HeaderConfig {
  leftAction?: ReactNode
  title?: string
  rightAction?: ReactNode
}

interface HeaderConfigContextValue {
  config: HeaderConfig
  setConfig: React.Dispatch<React.SetStateAction<HeaderConfig>>
  resetConfig: () => void
}

export const HeaderConfigContext =
  createContext<HeaderConfigContextValue | null>(null)

export const DEFAULT_HEADER_CONFIG: HeaderConfig = { title: 'L7 Cargo' }
