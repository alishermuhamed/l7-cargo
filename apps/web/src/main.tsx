import '@radix-ui/themes/styles.css'
import './index.css'
import './lib/i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app'

const container = document.getElementById('root')

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
