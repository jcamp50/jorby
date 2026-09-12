import { useEffect, useState } from 'react'
import { auth } from '@/osdk/client'

export function useFoundrySession() {
  const [token, setToken] = useState(() => auth?.getTokenOrUndefined())

  useEffect(() => {
    const oauth = auth
    if (!oauth) {
      return
    }

    const sync = () => setToken(oauth.getTokenOrUndefined())
    const signedOut = () => setToken(undefined)

    oauth.addEventListener('signIn', sync)
    oauth.addEventListener('refresh', sync)
    oauth.addEventListener('signOut', signedOut)
    sync()

    return () => {
      oauth.removeEventListener('signIn', sync)
      oauth.removeEventListener('refresh', sync)
      oauth.removeEventListener('signOut', signedOut)
    }
  }, [])

  return {
    isSignedIn: Boolean(token),
    signIn: () => {
      if (!auth) {
        throw new Error('Foundry OAuth is not configured')
      }
      return auth.signIn()
    },
    signOut: () => auth?.signOut(),
  }
}
