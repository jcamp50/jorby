import { JorbyHousehold, JorbySharedList, JorbySharedNote } from '@/osdk/resources'
import { useOsdkObject, useOsdkObjects } from '@osdk/react'
import { Clapperboard, ListTodo, MapPin, Package, StickyNote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { EmptyState, HeroCard, ScreenHeader } from '@/components/jorby/screen'
import { SnapshotCard, SnapshotRow } from '@/components/jorby/snapshot-row'
import { ErrorState, RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Button } from '@/components/ui/button'
import { AppErrorCode } from '@/lib/errors'
import { householdPath, listDetailPath } from '@/lib/routes'

export function FoundryHome({ householdId }: { householdId: string }) {
  const { object: household, isLoading: householdLoading } = useOsdkObject(
    JorbyHousehold,
    householdId,
    Boolean(householdId),
  )
  const { data, isLoading, error } = useOsdkObjects(JorbySharedList, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 20,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const lists = data ?? []
  const notes = useOsdkObjects(JorbySharedNote, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const noteCount = notes.data?.length ?? 0

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <div>
      <ScreenHeader
        title={household?.displayName ?? (householdLoading ? 'Home' : 'Household')}
        description="Lists and notes are live. Places, Watch, and Things still wait on the next SDK."
      />

      <HeroCard eyebrow="Live">
        <p className="text-lg font-semibold text-pretty">
          {lists.length === 0
            ? 'No shared lists yet. Create the first one from Lists.'
            : `${lists.length} open ${lists.length === 1 ? 'list' : 'lists'} in this household.`}
        </p>
      </HeroCard>

      <SnapshotRow label="Around the house">
        <SnapshotCard
          to={householdPath(householdId, 'lists')}
          icon={ListTodo}
          tone="lists"
          title="Lists"
          value={isLoading && lists.length === 0 ? '…' : String(lists.length)}
          hint="Live"
        />
        <SnapshotCard
          to={householdPath(householdId, 'notes')}
          icon={StickyNote}
          tone="notes"
          title="Notes"
          value={notes.isLoading && noteCount === 0 ? '…' : String(noteCount)}
          hint="Live"
        />
        <SnapshotCard
          to={householdPath(householdId, 'places')}
          icon={MapPin}
          tone="places"
          title="Places"
          value="—"
          hint="SDK next"
        />
        <SnapshotCard
          to={householdPath(householdId, 'watch')}
          icon={Clapperboard}
          tone="watch"
          title="Watch"
          value="—"
          hint="SDK next"
        />
        <SnapshotCard
          to={householdPath(householdId, 'things')}
          icon={Package}
          tone="things"
          title="Things"
          value="—"
          hint="SDK next"
        />
      </SnapshotRow>

      <div className="mb-5 flex flex-wrap justify-center gap-2">
        <Button asChild variant="secondary" className="h-11 rounded-full px-5">
          <Link to={householdPath(householdId, 'search')}>Search</Link>
        </Button>
        <Button asChild className="h-11 rounded-full px-5">
          <Link to={householdPath(householdId, 'lists')}>Open lists</Link>
        </Button>
      </div>

      <CardGroup label="Activity">
        {isLoading && lists.length === 0 ? (
          <RefreshingBanner />
        ) : lists.length === 0 ? (
          <EmptyState>Nothing has happened in this household yet.</EmptyState>
        ) : (
          <RowList>
            {lists.slice(0, 5).map((list) => (
              <LinkRow
                key={list.$primaryKey}
                to={listDetailPath(householdId, list.listId)}
                leading={<Tile icon={ListTodo} tone="lists" />}
                title={list.name ?? 'Untitled list'}
                subtitle={list.description ?? 'Shared list'}
              />
            ))}
          </RowList>
        )}
      </CardGroup>
    </div>
  )
}
