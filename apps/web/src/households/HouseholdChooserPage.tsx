import { House } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardGroup, Row } from '@/components/jorby/card-group'
import { SignedOutShell } from '@/components/jorby/signed-out'
import { Tile } from '@/components/jorby/tile'
import { Button } from '@/components/ui/button'
import { householdAppsPath } from '@/lib/routes'
import { FoundryHouseholds } from '@/osdk/FoundryHouseholds'
import { isFoundryConfigured } from '@/osdk/client'
import { useFoundrySession } from '@/osdk/session'
import { PROTOTYPE_HOUSEHOLD_ID } from '@/prototype/model'

export function HouseholdChooserPage() {
  const configured = isFoundryConfigured()
  const { isSignedIn } = useFoundrySession()

  return (
    <SignedOutShell>
      <h1 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Households</h1>
      <p className="mt-1.5 mb-6 text-sm text-muted-foreground text-pretty">
        {configured && isSignedIn
          ? 'Households you can see in Foundry appear first. The local mock is still below.'
          : 'Production loads active memberships from Foundry. The prototype has one household.'}
      </p>
      {configured && isSignedIn ? (
        <div className="mb-8">
          <FoundryHouseholds />
        </div>
      ) : null}
      <CardGroup label="Design mock">
        <Row
          leading={<Tile icon={House} tone="home" />}
          title="Our Home"
          subtitle="Jordan and Sam seed data. Never mixed into a live Foundry household."
        />
      </CardGroup>
      <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full">
        <Link to={householdAppsPath(PROTOTYPE_HOUSEHOLD_ID)}>Enter mock household</Link>
      </Button>
    </SignedOutShell>
  )
}
