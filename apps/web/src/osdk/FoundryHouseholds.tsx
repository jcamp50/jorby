import { JorbyHousehold } from '@/osdk/resources'
import { useOsdkObjects } from '@osdk/react'
import { House } from 'lucide-react'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { ErrorState, RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { AppErrorCode } from '@/lib/errors'
import { householdAppsPath } from '@/lib/routes'

export function FoundryHouseholds() {
  const { data, isLoading, error } = useOsdkObjects(JorbyHousehold, {
    where: { archivedAt: { $isNull: true } },
    orderBy: { displayName: 'asc' },
    pageSize: 50,
    streamUpdates: true,
  })
  const households = data ?? []

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  if (isLoading && households.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading households…</p>
  }

  if (households.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-pretty">
        No households are visible to this account yet. The membership service still has to
        provision the first one.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {isLoading ? <RefreshingBanner /> : null}
      <CardGroup>
        <RowList>
          {households.map((household) => (
            <LinkRow
              key={household.$primaryKey}
              to={householdAppsPath(household.householdId)}
              leading={<Tile icon={House} tone="home" />}
              title={household.displayName ?? 'Household'}
              subtitle={household.homeCity ?? undefined}
            />
          ))}
        </RowList>
      </CardGroup>
    </div>
  )
}
