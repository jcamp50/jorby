import { $ontologyRid } from '@jorby/sdk'
import { createClient } from '@osdk/client'
import { createPublicOauthClient } from '@osdk/oauth'

function readPublicEnv() {
  const apiUrl = import.meta.env.VITE_FOUNDRY_API_URL
  const clientId = import.meta.env.VITE_FOUNDRY_CLIENT_ID
  const redirectUrl = import.meta.env.VITE_FOUNDRY_REDIRECT_URL
  if (!apiUrl || !clientId || !redirectUrl) {
    return undefined
  }
  return { apiUrl, clientId, redirectUrl }
}

/** Local Vite proxies `/api` and `/multipass` so the browser stays same-origin. */
function ontologyBaseUrl(configured: string) {
  if (
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  ) {
    return window.location.origin
  }
  return configured
}

const publicEnv = readPublicEnv()
const apiUrl = publicEnv ? ontologyBaseUrl(publicEnv.apiUrl) : undefined

export const auth = publicEnv && apiUrl
  ? createPublicOauthClient(publicEnv.clientId, apiUrl, publicEnv.redirectUrl, {
      loginPage: '/welcome',
      postLoginPage: '/households',
      scopes: ['api:use-ontologies-read', 'api:use-ontologies-write'],
    })
  : undefined

export const client = publicEnv && apiUrl && auth
  ? createClient(apiUrl, $ontologyRid, auth)
  : undefined

export function isFoundryConfigured() {
  return client != null
}
