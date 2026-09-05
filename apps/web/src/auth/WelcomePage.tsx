import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-medium tracking-tight">Jorby</h1>
      <p className="text-sm text-muted-foreground">
        Shared household catalog. Consumer OAuth is not configured in this scaffold.
      </p>
      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link to="/households">Continue to household chooser</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/auth/callback">Auth callback route</Link>
        </Button>
      </div>
    </main>
  )
}
