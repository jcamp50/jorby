import { House, Landmark } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { SignedOutShell } from '@/components/jorby/signed-out'
import { Tile } from '@/components/jorby/tile'
import { Button } from '@/components/ui/button'
import { financePath, householdPath } from '@/lib/routes'
import { JorbyHousehold } from '@/osdk/resources'
import { usesFoundryData } from '@/osdk/household-route'
import { useOsdkObject } from '@osdk/react'

export function ModeChooserPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryModeChooser householdId={householdId} />
  }
  return <ModeChooser householdId={householdId} name="Our Home" live={false} />
}

function FoundryModeChooser({ householdId }: { householdId: string }) {
  const { object: household } = useOsdkObject(JorbyHousehold, householdId, Boolean(householdId))
  return (
    <ModeChooser
      householdId={householdId}
      name={household?.displayName ?? 'Household'}
      live
    />
  )
}

function ModeChooser({
  householdId,
  name,
  live,
}: {
  householdId: string
  name: string
  live: boolean
}) {
  return (
    <SignedOutShell>
      <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {name}
      </p>
      <h1 className="mt-1 text-[1.75rem] font-extrabold tracking-[-0.02em] text-pretty">
        What do you want to open?
      </h1>
      <p className="mt-1.5 mb-6 text-sm text-muted-foreground text-pretty">
        Same household. Two apps. Home is life. Finance is household money.
      </p>
      <CardGroup>
        <RowList>
          <LinkRow
            to={householdPath(householdId, 'home')}
            leading={<Tile icon={House} tone="home" />}
            title="Jorby Home"
            subtitle="Lists, notes, places, watch, things"
          />
          <LinkRow
            to={financePath(householdId)}
            leading={<Tile icon={Landmark} tone="finance" />}
            title="Jorby Finance"
            subtitle={
              live
                ? 'Household money. Prototype only — no live ledger yet.'
                : 'Accounts, cards, budgets, goals, bills'
            }
          />
        </RowList>
      </CardGroup>
      <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full">
        <Link to="/households">Switch household</Link>
      </Button>
    </SignedOutShell>
  )
}
