/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOUNDRY_API_URL?: string
  readonly VITE_FOUNDRY_CLIENT_ID?: string
  readonly VITE_FOUNDRY_REDIRECT_URL?: string
  readonly VITE_MEMBERSHIP_SERVICE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
