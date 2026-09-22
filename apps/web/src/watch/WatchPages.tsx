import { Film, Tv } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { WatchCreate } from '@/components/jorby/create/forms'
import {
  EmptyState,
  ScreenHeader,
} from '@/components/jorby/screen'
import { SectionTabs } from '@/components/jorby/section-tabs'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { toastResult } from '@/lib/action-toast'
import { householdPath, watchDetailPath } from '@/lib/routes'
import { watchStatusLabel } from '@/lib/watch-display'
import { FoundryWatchDetail, FoundryWatchIndex } from '@/osdk/FoundryWatch'
import { usesFoundryData } from '@/osdk/household-route'
import { catalogHits, everyoneWants, extraWatchCatalog } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'
import { WatchDetailView } from '@/watch/WatchDetailView'

const statuses = ['WATCHING', 'WATCHLIST', 'WATCHED'] as const
const statusLabel: Record<(typeof statuses)[number], string> = {
  WATCHING: 'Watching',
  WATCHLIST: 'Watchlist',
  WATCHED: 'Watched',
}

export function WatchIndexPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryWatchIndex householdId={householdId} />
  }
  return <PrototypeWatchIndex householdId={householdId} />
}

function PrototypeWatchIndex({ householdId }: { householdId: string }) {
  const { watch, members, createWatch } = usePrototype()
  const [status, setStatus] = useState<(typeof statuses)[number]>('WATCHING')
  const [query, setQuery] = useState('')
  const hits = catalogHits(
    extraWatchCatalog,
    query,
    watch.map((entry) => entry.title),
  )
  const visible = useMemo(
    () => watch.filter((entry) => entry.status === status),
    [status, watch],
  )

  return (
    <div>
      <ScreenHeader title="Watch" />
      <SectionTabs
        label="Filter by status"
        value={status}
        onValueChange={(value) => setStatus(value as (typeof statuses)[number])}
        options={statuses.map((item) => ({ value: item, label: statusLabel[item] }))}
      />
      {visible.length === 0 ? (
        <EmptyState>Nothing in {statusLabel[status]} yet.</EmptyState>
      ) : (
        <CardGroup>
          <RowList>
            {visible.map((entry) => (
              <LinkRow
                key={entry.id}
                to={watchDetailPath(householdId, entry.id)}
                leading={<Tile icon={entry.mediaType === 'SHOW' ? Tv : Film} tone="watch" />}
                title={entry.title}
                subtitle={`${entry.year} · ${entry.mediaType === 'SHOW' ? 'Show' : 'Movie'}`}
                meta={
                  <>
                    <Badge variant="secondary" className="rounded-full capitalize">
                      {entry.status.toLowerCase()}
                    </Badge>
                    {everyoneWants(entry, members.length) ? (
                      <Badge className="rounded-full">Both want it</Badge>
                    ) : null}
                  </>
                }
                trailing={
                  entry.mediaType === 'SHOW' && entry.lastWatchedSeasonNumber ? (
                    <span className="text-sm font-semibold tabular-nums">
                      S{entry.lastWatchedSeasonNumber}·E{entry.lastWatchedEpisodeNumber}
                    </span>
                  ) : undefined
                }
              />
            ))}
          </RowList>
        </CardGroup>
      )}

      <WatchCreate
        hits={hits.map((hit) => ({
          id: hit.id,
          title: hit.name,
          subtitle: `${hit.year} · ${hit.mediaType === 'SHOW' ? 'Show' : 'Movie'}`,
          year: hit.year,
          mediaType: hit.mediaType,
        }))}
        onQueryChange={setQuery}
        onCreate={(input) =>
          toastResult(
            createWatch(input.title, {
              mediaType: input.mediaType,
              year: input.year,
              status: input.status,
              wantsIt: input.wantsIt,
              tags: input.tags,
            }),
          )
        }
      />
    </div>
  )
}

export function WatchDetailPage() {
  const { watchEntryId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryWatchDetail householdId={householdId} watchEntryId={watchEntryId} />
  }
  return <PrototypeWatchDetail householdId={householdId} watchEntryId={watchEntryId} />
}

function PrototypeWatchDetail({
  householdId,
  watchEntryId,
}: {
  householdId: string
  watchEntryId: string
}) {
  const { watch, members, currentMembershipId, toggleWantToWatch } = usePrototype()
  const entry = watch.find((item) => item.id === watchEntryId)

  if (!entry) {
    return <NotFoundState backTo={householdPath(householdId, 'watch')} backLabel="Watch" />
  }

  const suggestedBy = members.filter((member) => entry.wantsMembershipIds.includes(member.id))

  return (
    <WatchDetailView
      householdId={householdId}
      title={entry.title}
      year={entry.year}
      mediaType={entry.mediaType}
      statusLabel={watchStatusLabel(entry)}
      overview={entry.overview}
      posterUrl={
        entry.posterUrl ?? `https://picsum.photos/seed/${encodeURIComponent(entry.id)}/400/600`
      }
      director={entry.director}
      genres={entry.genres}
      cast={entry.cast}
      suggestedBy={suggestedBy}
      everyoneWants={everyoneWants(entry, members.length)}
      reviews={entry.reviews}
      members={members}
      wants={entry.wantsMembershipIds.includes(currentMembershipId)}
      onToggleWant={() => toggleWantToWatch(entry.id)}
    />
  )
}
