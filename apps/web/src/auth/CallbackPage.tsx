import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignedOutShell } from '@/components/jorby/signed-out'
import { auth } from '@/osdk/client'

export function CallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setError('Foundry OAuth is not configured.')
      return
    }
    void auth
      .signIn()
      .then(() => {
        // @osdk/oauth uses history.replaceState, which does not notify React Router.
        navigate('/households', { replace: true })
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : 'Sign-in failed.')
      })
  }, [navigate])

  return (
    <SignedOutShell>
      <h1 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Signing in</h1>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-muted-foreground text-pretty">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Finishing Foundry login…
        </p>
      )}
    </SignedOutShell>
  )
}
