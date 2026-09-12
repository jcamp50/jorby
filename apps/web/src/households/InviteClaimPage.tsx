import { useParams } from 'react-router-dom'
import { SignedOutShell } from '@/components/jorby/signed-out'

export function InviteClaimPage() {
  const { token } = useParams()

  return (
    <SignedOutShell>
      <h1 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Claim invite</h1>
      <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
        Production claims go through the membership service. The prototype does not consume tokens.
      </p>
      <p className="sr-only">Invite token present: {token ? 'yes' : 'no'}</p>
    </SignedOutShell>
  )
}
