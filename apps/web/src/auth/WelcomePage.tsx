import { Link } from 'react-router-dom'
import { SignedOutShell } from '@/components/jorby/signed-out'
import { Button } from '@/components/ui/button'
import { isFoundryConfigured } from '@/osdk/client'
import { useFoundrySession } from '@/osdk/session'

export function WelcomePage() {
  const configured = isFoundryConfigured()
  const { isSignedIn, signIn } = useFoundrySession()

  return (
    <SignedOutShell>
      <p className="text-[11px] font-medium text-foreground/45">
        {configured ? 'Foundry OAuth · consumer client' : 'UI prototype · this repo is frontend only'}
      </p>
      <h1 className="mt-3 text-[2rem] font-extrabold tracking-[-0.02em]">Jorby</h1>
      <p className="mt-2 text-[0.9375rem] text-muted-foreground text-pretty">
        {configured
          ? 'Sign in with your Foundry account to open a live household. The local mock is still available.'
          : 'Shared household catalog. OAuth is not configured. Continue into the mock household of Jordan and Sam.'}
      </p>
      {configured && isSignedIn ? (
        <Button asChild size="lg" className="mt-8 h-12 w-full rounded-full">
          <Link to="/households">Continue to households</Link>
        </Button>
      ) : configured ? (
        <Button
          size="lg"
          className="mt-8 h-12 w-full rounded-full"
          onClick={() => {
            void signIn()
          }}
        >
          Sign in with Foundry
        </Button>
      ) : null}
      <Button
        asChild
        size="lg"
        variant={configured ? 'outline' : 'default'}
        className={configured ? 'mt-3 h-12 w-full rounded-full' : 'mt-8 h-12 w-full rounded-full'}
      >
        <Link to="/households">{configured ? 'Continue with local mock' : 'Continue'}</Link>
      </Button>
    </SignedOutShell>
  )
}
