import { House } from 'lucide-react'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
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
  const { isSignedIn, signIn } = useFoundrySession()

  return (
    <SignedOutShell>
      <h1 className="mb-6 text-[1.75rem] font-extrabold tracking-[-0.02em]">Households</h1>
      {configured && isSignedIn ? (
        <div className="mb-8">
          <FoundryHouseholds />
        </div>
      ) : configured ? (
        <Button
          size="lg"
          className="mb-8 h-12 w-full rounded-full"
          onClick={() => {
            void signIn()
          }}
        >
          Sign in with Foundry
        </Button>
      ) : null}
      <CardGroup>
        <RowList>
          <LinkRow
            to={householdAppsPath(PROTOTYPE_HOUSEHOLD_ID)}
            leading={<Tile icon={House} tone="home" />}
            title="Our Home"
          />
        </RowList>
      </CardGroup>
    </SignedOutShell>
  )
}
