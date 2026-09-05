import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4">
      <p className="text-xs text-muted-foreground">UI prototype · this repo is frontend only</p>
      <h1 className="text-2xl font-medium tracking-tight">Jorby</h1>
      <p className="text-sm text-muted-foreground">
        Shared household catalog. OAuth is not wired. Continue into the mock household of Jordan and Sam.
      </p>
      <Button asChild>
        <Link to="/households">Continue</Link>
      </Button>
    </main>
  )
}
