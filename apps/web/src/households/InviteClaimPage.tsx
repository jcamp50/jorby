import { useParams } from 'react-router-dom'

export function InviteClaimPage() {
  const { token } = useParams()

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-3 px-4">
      <h1 className="text-2xl font-medium tracking-tight">Claim invite</h1>
      <p className="text-sm text-muted-foreground">
        Production claims go through the membership service. The prototype does not consume tokens.
      </p>
      <p className="sr-only">Invite token present: {token ? 'yes' : 'no'}</p>
    </main>
  )
}
