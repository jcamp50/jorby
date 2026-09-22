import {
  createJorbyManualWatchEntry,
  getJorbyMediaTitleDetails,
  getJorbyWatchTonight,
  JorbyHousehold,
  JorbyHouseholdMembership,
  JorbyMediaTitle,
  JorbyWatchEntry,
  JorbyWatchReaction,
  manageJorbyWatchProvider,
  manageJorbyWatchReaction,
  searchJorbyMediaTitles,
  setJorbyWatchEntryArchived,
  setJorbyWatchProgress,
  setJorbyWatchStatus,
} from '@/osdk/resources'
import { useOsdkAction, useOsdkFunction, useOsdkObject, useOsdkObjects } from '@osdk/react'
import { Film, Tv } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { WatchCreate } from '@/components/jorby/create/forms'
import {
  EmptyState,
  HeroCard,
  ScreenHeader,
} from '@/components/jorby/screen'
import { SectionTabs } from '@/components/jorby/section-tabs'
import { ErrorState, NotFoundState, RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/lib/debounce'
import { AppErrorCode } from '@/lib/errors'
import { householdPath, watchDetailPath } from '@/lib/routes'
import { watchStatusLabel } from '@/lib/watch-display'
import { memberFromMembership } from '@/osdk/member'
import { watchProviderOperation, watchReactionOperation } from '@/osdk/operations'
import { mediaDetailsFromSource, mediaHitsFromQuery, mergeMediaDetails } from '@/osdk/provider-hits'
import { useMyMembership } from '@/osdk/useMyMembership'
import { toast } from 'sonner'
import { WatchDetailView } from '@/watch/WatchDetailView'

const statuses = ['WATCHING', 'WATCHLIST', 'WATCHED'] as const
const statusLabel: Record<(typeof statuses)[number], string> = {
  WATCHING: 'Watching',
  WATCHLIST: 'Watchlist',
  WATCHED: 'Watched',
}

export function FoundryWatchIndex({ householdId }: { householdId: string }) {
  const { object: household, isLoading: householdLoading } = useOsdkObject(
    JorbyHousehold,
    householdId,
    Boolean(householdId),
  )
  const { data, isLoading, error } = useOsdkObjects(JorbyWatchEntry, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const tonight = useOsdkFunction(getJorbyWatchTonight, {
    params: { householdId },
    enabled: Boolean(householdId),
  })
  const createManual = useOsdkAction(createJorbyManualWatchEntry)
  const saveProvider = useOsdkAction(manageJorbyWatchProvider)
  const [status, setStatus] = useState<(typeof statuses)[number]>('WATCHING')
  const [search, setSearch] = useState('')
  const term = useDebouncedValue(search.trim(), 300)
  const titles = useOsdkFunction(searchJorbyMediaTitles, {
    params: { provider: 'MOCK', query: term, page: 1, pageSize: 8 },
    enabled: term.length >= 2,
  })
  const entries = data ?? []
  const visible = entries.filter((entry) => entry.status === status)
  const hits = mediaHitsFromQuery(titles.data)
  const tonightCount = Array.isArray(tonight.data) ? tonight.data.length : 0

  async function onCreate(input: {
    title: string
    mediaType: 'MOVIE' | 'SHOW'
    providerId?: string
  }) {
    if (!household || input.title.trim() === '') {
      return false
    }
    try {
      if (input.providerId) {
        await saveProvider.applyAction({
          operation: watchProviderOperation.saveProvider,
          householdId: household.householdId,
          provider: 'MOCK',
          providerMediaTitleId: input.providerId,
        })
      } else {
        await createManual.applyAction({
          household,
          displayTitle: input.title.trim(),
          mediaType: input.mediaType,
        })
      }
      return true
    } catch {
      toast.error('The title could not be created.')
      return false
    }
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <div>
      <ScreenHeader title="Watch" />
      {tonightCount > 0 ? (
        <HeroCard eyebrow="Watch tonight">
          <p className="text-lg font-semibold text-pretty">
            {tonightCount} {tonightCount === 1 ? 'title' : 'titles'} everyone wants.
          </p>
        </HeroCard>
      ) : null}
      <SectionTabs
        label="Filter by status"
        value={status}
        onValueChange={(value) => setStatus(value as (typeof statuses)[number])}
        options={statuses.map((item) => ({ value: item, label: statusLabel[item] }))}
      />
      {isLoading && entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading titles…</p>
      ) : visible.length === 0 ? (
        <EmptyState>Nothing in {statusLabel[status]} yet.</EmptyState>
      ) : (
        <>
          {isLoading ? <RefreshingBanner /> : null}
          <CardGroup>
            <RowList>
              {visible.map((entry) => (
                <LinkRow
                  key={entry.$primaryKey}
                  to={watchDetailPath(householdId, entry.watchEntryId)}
                  leading={<Tile icon={entry.mediaType === 'SHOW' ? Tv : Film} tone="watch" />}
                  title={entry.displayTitle ?? 'Untitled'}
                  subtitle={entry.mediaType === 'SHOW' ? 'Show' : 'Movie'}
                  meta={
                    <>
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {String(entry.status ?? '').toLowerCase()}
                      </Badge>
                      {entry.mediaTitleId == null ? (
                        <Badge variant="secondary" className="rounded-full">
                          Manual
                        </Badge>
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
        </>
      )}

      <WatchCreate
        hits={hits.map((hit) => ({
          id: hit.id,
          title: hit.name,
          subtitle: hit.subtitle,
          mediaType: hit.mediaType === 'SHOW' ? 'SHOW' : hit.mediaType === 'MOVIE' ? 'MOVIE' : undefined,
          year: hit.year,
        }))}
        hitsLoading={titles.isLoading}
        busy={createManual.isPending || saveProvider.isPending || householdLoading || !household}
        onQueryChange={setSearch}
        onCreate={(input) => onCreate(input)}
      />
    </div>
  )
}

export function FoundryWatchDetail({
  householdId,
  watchEntryId,
}: {
  householdId: string
  watchEntryId: string
}) {
  const navigate = useNavigate()
  const { object: entry, isLoading, error } = useOsdkObject(
    JorbyWatchEntry,
    watchEntryId,
    Boolean(watchEntryId),
  )
  const reactions = useOsdkObjects(JorbyWatchReaction, {
    where: {
      householdId: { $eq: householdId },
      watchEntryId: { $eq: watchEntryId },
      archivedAt: { $isNull: true },
    },
    pageSize: 20,
    streamUpdates: true,
    enabled: Boolean(watchEntryId),
  })
  const membersQuery = useOsdkObjects(JorbyHouseholdMembership, {
    where: { householdId: { $eq: householdId } },
    pageSize: 20,
    enabled: Boolean(householdId),
  })
  const me = useMyMembership(householdId)
  const setStatus = useOsdkAction(setJorbyWatchStatus)
  const setProgress = useOsdkAction(setJorbyWatchProgress)
  const setReaction = useOsdkAction(manageJorbyWatchReaction)
  const archiveEntry = useOsdkAction(setJorbyWatchEntryArchived)
  const mediaTitleId = typeof entry?.mediaTitleId === 'string' ? entry.mediaTitleId : undefined
  const titleRecord = useOsdkObject(JorbyMediaTitle, mediaTitleId ?? '', Boolean(mediaTitleId))
  const details = useOsdkFunction(getJorbyMediaTitleDetails, {
    params: { provider: 'MOCK', mediaTitleId: mediaTitleId ?? '' },
    enabled: Boolean(mediaTitleId),
  })
  const [rating, setRating] = useState('8')
  const rows = reactions.data ?? []
  const members = (membersQuery.data ?? []).map(memberFromMembership)
  const mine = rows.find((row) => row.membershipId === me.data?.membershipId)
  const wants = mine?.stage === 'WANTS_TO_WATCH'
  const reviews = rows.flatMap((row) =>
    row.stage === 'REVIEWED' && row.membershipId != null && row.ratingHalfStars != null
      ? [
          {
            membershipId: row.membershipId,
            ratingHalfStars: row.ratingHalfStars,
            reviewText: row.reviewText ?? '',
          },
        ]
      : [],
  )
  const canReview = entry?.status === 'WATCHED' || entry?.status === 'DROPPED'
  const busy =
    setStatus.isPending || setProgress.isPending || setReaction.isPending || archiveEntry.isPending

  async function onStatus(status: (typeof statuses)[number]) {
    if (!entry || entry.revision == null) {
      return
    }
    try {
      await setStatus.applyAction({
        watchEntry: entry,
        expectedRevision: entry.revision,
        status,
      })
    } catch {
      toast.error('The status could not be updated.')
    }
  }

  async function onProgress() {
    if (!entry || entry.revision == null) {
      return
    }
    try {
      await setProgress.applyAction({
        watchEntry: entry,
        expectedRevision: entry.revision,
      })
    } catch {
      toast.error('Progress could not be saved.')
    }
  }

  async function onWant() {
    if (!entry || entry.revision == null) {
      return
    }
    try {
      await setReaction.applyAction({
        watchEntry: entry,
        expectedWatchEntryRevision: entry.revision,
        expectedReactionRevision: mine?.revision,
        operation: watchReactionOperation.want,
      })
    } catch {
      toast.error('Your reaction could not be saved.')
    }
  }

  async function onReview(event: FormEvent) {
    event.preventDefault()
    if (!entry || entry.revision == null || !canReview) {
      return
    }
    try {
      await setReaction.applyAction({
        watchEntry: entry,
        expectedWatchEntryRevision: entry.revision,
        expectedReactionRevision: mine?.revision,
        operation: watchReactionOperation.review,
        ratingHalfStars: Number(rating),
      })
    } catch {
      toast.error('The review could not be saved.')
    }
  }

  async function onArchive() {
    if (!entry || entry.revision == null) {
      return
    }
    try {
      await archiveEntry.applyAction({
        watchEntry: entry,
        expectedRevision: entry.revision,
        isArchived: true,
      })
      navigate(householdPath(householdId, 'watch'), { replace: true })
    } catch {
      toast.error('The title could not be archived.')
    }
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }
  if (isLoading && !entry) {
    return <p className="text-sm text-muted-foreground">Loading title…</p>
  }
  if (!entry || entry.householdId !== householdId) {
    return <NotFoundState backTo={householdPath(householdId, 'watch')} backLabel="Watch" />
  }

  const meta = mergeMediaDetails(
    mediaDetailsFromSource(details.data),
    mediaDetailsFromSource(titleRecord.object),
    mediaDetailsFromSource(entry),
  )
  const wantIds = new Set(
    rows.flatMap((row) => (row.stage === 'WANTS_TO_WATCH' && row.membershipId ? [row.membershipId] : [])),
  )
  const suggestedBy = members.filter((member) => wantIds.has(member.id))

  return (
    <WatchDetailView
      householdId={householdId}
      title={entry.displayTitle ?? meta.title ?? 'Untitled'}
      year={meta.year}
      mediaType={entry.mediaType ?? meta.mediaType}
      statusLabel={watchStatusLabel({
        status: entry.status,
        mediaType: entry.mediaType,
        lastWatchedSeasonNumber: entry.lastWatchedSeasonNumber,
        lastWatchedEpisodeNumber: entry.lastWatchedEpisodeNumber,
      })}
      overview={meta.overview}
      posterUrl={meta.posterUrl}
      director={meta.director}
      genres={meta.genres}
      cast={meta.cast}
      suggestedBy={suggestedBy}
      everyoneWants={suggestedBy.length > 0 && suggestedBy.length === members.length}
      reviews={reviews}
      members={members}
      wants={wants}
      busy={busy || !me.data}
      onToggleWant={() => {
        void onWant()
      }}
      sticky={
        canReview ? (
          <form onSubmit={onReview} className="flex gap-2">
            <Input
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              inputMode="numeric"
              aria-label="Rating in half-stars from 1 to 10"
              className="h-11 rounded-full border-0 bg-secondary"
            />
            <Button type="submit" size="lg" className="h-11 shrink-0 rounded-full" disabled={busy}>
              Review
            </Button>
          </form>
        ) : null
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((item) => (
          <Button
            key={item}
            type="button"
            variant={entry.status === item ? 'default' : 'outline'}
            className="h-11 rounded-full capitalize"
            disabled={busy}
            onClick={() => {
              void onStatus(item)
            }}
          >
            {statusLabel[item]}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full"
          disabled={busy}
          onClick={() => {
            void onArchive()
          }}
        >
          Archive
        </Button>
      </div>

      {entry.mediaType === 'SHOW' ? (
        <div className="mb-4">
          <Button
            type="button"
            className="h-11 rounded-full"
            disabled={busy}
            onClick={() => {
              void onProgress()
            }}
          >
            Advance progress
          </Button>
        </div>
      ) : null}
    </WatchDetailView>
  )
}
