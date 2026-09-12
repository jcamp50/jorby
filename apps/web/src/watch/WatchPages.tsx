import { Check, Clapperboard, Film, Minus, Tv } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CardGroup, LinkRow, Row, RowList } from '@/components/jorby/card-group'
import { MemberMark } from '@/components/jorby/member-mark'
import { ReviewGroup } from '@/components/jorby/review'
import {
  BackLink,
  EmptyState,
  FilterChip,
  FilterRow,
  HeroCard,
  ScreenHeader,
  StickyActions,
} from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { householdPath, watchDetailPath } from '@/lib/routes'
import { FoundryCatalogPending } from '@/osdk/FoundryCatalogPending'
import { usesFoundryData } from '@/osdk/household-route'
import { everyoneWants } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

const statuses = ['WATCHLIST', 'WATCHING', 'WATCHED', 'DROPPED'] as const

export function WatchIndexPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return (
      <FoundryCatalogPending
        title="Watch"
        body="Watch entries are not in the consumer SDK yet. TMDB search will stay in Foundry Functions."
      />
    )
  }
  return <PrototypeWatchIndex householdId={householdId} />
}

function PrototypeWatchIndex({ householdId }: { householdId: string }) {
  const { watch, members } = usePrototype()
  const [status, setStatus] = useState<(typeof statuses)[number] | 'ALL'>('ALL')
  const visible = useMemo(
    () => (status === 'ALL' ? watch : watch.filter((entry) => entry.status === status)),
    [status, watch],
  )

  return (
    <div>
      <ScreenHeader
        title="Watch"
        description="Shared progress on shows. A missing want is not a yes."
      />
      <FilterRow label="Filter by status">
        {(['ALL', ...statuses] as const).map((item) => (
          <FilterChip key={item} active={status === item} onClick={() => setStatus(item)}>
            <span className="capitalize">{item === 'ALL' ? 'All' : item.toLowerCase()}</span>
          </FilterChip>
        ))}
      </FilterRow>
      {visible.length === 0 ? (
        <EmptyState>Nothing matches this filter.</EmptyState>
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
    </div>
  )
}

export function WatchDetailPage() {
  const { watchEntryId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return (
      <FoundryCatalogPending
        title="Watch"
        body="Watch entries are not in the consumer SDK yet. TMDB search will stay in Foundry Functions."
      />
    )
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

  const wants = entry.wantsMembershipIds.includes(currentMembershipId)
  const bothWant = everyoneWants(entry, members.length)

  return (
    <div>
      <BackLink to={householdPath(householdId, 'watch')} label="Watch" />
      <ScreenHeader
        title={entry.title}
        description={`${entry.year} · ${entry.mediaType === 'SHOW' ? 'Show' : 'Movie'}`}
      />

      <HeroCard eyebrow="Who wants it">
        <p className="text-2xl font-bold tracking-tight text-pretty">
          {bothWant
            ? 'You both want to watch this.'
            : `${entry.wantsMembershipIds.length} of ${members.length} said yes.`}
        </p>
        <p className="mt-1.5 text-[0.9375rem] font-medium text-white/85">
          A missing answer is not a yes.
        </p>
      </HeroCard>

      <CardGroup label="Us">
        <RowList>
          {members.map((member) => {
            const memberWants = entry.wantsMembershipIds.includes(member.id)
            return (
              <Row
                key={member.id}
                leading={<MemberMark member={member} size="default" />}
                title={member.displayName}
                trailing={
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    {memberWants ? (
                      <Check className="size-4" aria-hidden />
                    ) : (
                      <Minus className="size-4" aria-hidden />
                    )}
                    {memberWants ? 'Wants it' : 'Has not said yes'}
                  </span>
                }
              />
            )
          })}
        </RowList>
      </CardGroup>

      <CardGroup label="Details">
        <RowList>
          <Row
            leading={<Tile icon={Clapperboard} tone="watch" variant="soft" />}
            title="Status"
            trailing={
              <span className="text-sm font-semibold capitalize">{entry.status.toLowerCase()}</span>
            }
          />
          {entry.mediaType === 'SHOW' ? (
            <Row
              leading={<Tile icon={Tv} tone="watch" variant="soft" />}
              title="Progress"
              trailing={
                <span className="text-sm font-semibold tabular-nums">
                  {entry.lastWatchedSeasonNumber
                    ? `S${entry.lastWatchedSeasonNumber} · E${entry.lastWatchedEpisodeNumber}`
                    : 'Not started'}
                </span>
              }
            />
          ) : null}
        </RowList>
      </CardGroup>

      {entry.reviews.length > 0 ? (
        <ReviewGroup
          reviews={entry.reviews}
          members={members}
          emptyMessage="Neither of us has reviewed this yet."
        />
      ) : null}

      <StickyActions>
        <Button
          type="button"
          size="lg"
          variant={wants ? 'default' : 'outline'}
          aria-pressed={wants}
          className="h-11 w-full rounded-full"
          onClick={() => toggleWantToWatch(entry.id)}
        >
          {wants ? 'You want to watch this' : 'I want to watch this'}
        </Button>
      </StickyActions>
    </div>
  )
}
