import { OsdkProvider } from '@osdk/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from '@/app/router'
import { client } from '@/osdk/client'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {client ? (
      <OsdkProvider client={client}>
        <AppRouter />
      </OsdkProvider>
    ) : (
      <AppRouter />
    )}
  </StrictMode>,
)
