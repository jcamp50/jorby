import { ChevronDown, ChevronUp, Clapperboard, ListTodo, MapPin, Package, StickyNote, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MemberMark } from '@/components/jorby/member-mark'
import { EmptyState } from '@/components/jorby/screen'
import { RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import type { TileTone } from '@/components/jorby/tile'
import { formatActivityTime, type ActivityEvent, type ActivityKind } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { memberFromName } from '@/osdk/member'
import type { Member } from '@/prototype/model'

export const ACTIVITY_PREVIEW_COUNT = 5

const activityStyle: Record<ActivityKind, { tone: TileTone; icon: LucideIcon }> = {
  lists: { tone: 'lists', icon: ListTodo },
  notes: { tone: 'notes', icon: StickyNote },
  places: { tone: 'places', icon: MapPin },
  watch: { tone: 'watch', icon: Clapperboard },
  things: { tone: 'things', icon: Package },
}

export type HomeActivity = ActivityEvent & {
  to: string
  member?: Member
}

function actor(event: HomeActivity): Member {
  return event.member ?? memberFromName(event.actorId || event.actorName, event.actorName)
}

function isCurrentActor(event: HomeActivity, youActorIds: readonly string[]) {
  if (youActorIds.length === 0) {
    return false
  }
  return youActorIds.includes(event.actorId) || (event.member != null && youActorIds.includes(event.member.id))
}

function verbForActor(verb: string, you: boolean) {
  if (you && verb.startsWith('wants ')) {
    return `want ${verb.slice(6)}`
  }
  return verb
}

function ObjectChips({ event }: { event: HomeActivity }) {
  const style = activityStyle[event.kind]
  const labels =
    event.items && event.items.length > 0 ? event.items.slice(0, 4) : [event.objectTitle]
  const extra = event.items && event.items.length > 4 ? event.items.length - 4 : 0
  return (
    <>
      {labels.map((label, index) => (
        <Link
          key={`${label}:${index}`}
          to={event.to}
          className={cn(
            'inline-flex h-11 max-w-[12rem] items-center gap-1.5 rounded-full bg-card px-2 shadow-card',
            'transition-colors hover:bg-accent/60',
          )}
        >
          <Tile icon={style.icon} tone={style.tone} className="size-7 rounded-lg [&_svg]:size-3.5" />
          <span className="truncate text-sm font-semibold">{label}</span>
        </Link>
      ))}
      {extra > 0 ? (
        <Link
          to={event.to}
          className="inline-flex h-11 items-center rounded-full bg-card px-3 text-sm font-medium text-muted-foreground shadow-card"
        >
          +{extra} more
        </Link>
      ) : null}
    </>
  )
}

function TimelineRow({
  event,
  now,
  youActorIds,
}: {
  event: HomeActivity
  now?: number
  youActorIds: readonly string[]
}) {
  const person = actor(event)
  const when = formatActivityTime(event.at, now)
  const you = isCurrentActor(event, youActorIds)
  const name = you ? 'You' : event.actorName
  const verb = verbForActor(event.verb, you)
  const hasItems = Boolean(event.items && event.items.length > 0)
  return (
    <article className="flex gap-3">
      <MemberMark member={person} size="default" className="mt-1" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-2 text-[0.9375rem] leading-6">
            <span className="font-semibold">{name}</span>
            <span>{verb}</span>
            <ObjectChips event={event} />
            {hasItems ? (
              <span>
                to <span className="font-medium">{event.objectTitle}</span>
              </span>
            ) : null}
          </p>
          {when ? (
            <span className="flex h-11 shrink-0 items-center text-xs text-muted-foreground tabular-nums whitespace-nowrap">
              {when}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function ActivityFeed({
  activity,
  loading,
  now,
  youActorIds = [],
}: {
  activity: HomeActivity[]
  loading?: boolean
  now?: number
  youActorIds?: readonly string[]
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? activity : activity.slice(0, ACTIVITY_PREVIEW_COUNT)
  const extra = activity.length - ACTIVITY_PREVIEW_COUNT

  return (
    <section className="mb-6">
      <h2 className="mb-3 px-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Activity
      </h2>

      {loading && activity.length === 0 ? (
        <RefreshingBanner />
      ) : activity.length === 0 ? (
        <EmptyState>Nothing has happened yet.</EmptyState>
      ) : (
        <>
          <div className="space-y-5">
            {visible.map((event) => (
              <TimelineRow key={event.id} event={event} now={now} youActorIds={youActorIds} />
            ))}
          </div>
          {extra > 0 ? (
            <button
              type="button"
              className="mt-2 flex h-11 w-full scroll-mb-[var(--tab-bar-space)] items-center justify-center gap-1 rounded-full text-sm font-medium text-muted-foreground hover:bg-card"
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? (
                <>
                  Show less
                  <ChevronUp className="size-4" aria-hidden />
                </>
              ) : (
                <>
                  Show {extra} more
                  <ChevronDown className="size-4" aria-hidden />
                </>
              )}
            </button>
          ) : null}
        </>
      )}
    </section>
  )
}
