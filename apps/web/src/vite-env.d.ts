/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOUNDRY_URL?: string
  readonly VITE_OAUTH_CLIENT_ID?: string
  readonly VITE_MEMBERSHIP_SERVICE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
