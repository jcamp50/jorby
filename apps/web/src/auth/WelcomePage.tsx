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
      <h1 className="text-[2rem] font-extrabold tracking-[-0.02em]">Jorby</h1>
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
