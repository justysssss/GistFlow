import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DevPlaceholder from './DevPlaceholder'

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <DevPlaceholder />
    </StrictMode>,
  )
}
