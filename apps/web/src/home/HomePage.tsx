import { ArrowRight, Clapperboard, ListTodo, MapPin, Package, Star, StickyNote } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Stat } from '@/components/jorby/amount'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { MemberChip } from '@/components/jorby/member-mark'
import { Rating } from '@/components/jorby/rating'
import {
  EmptyState,
  GroupLink,
  HeroAction,
  HeroCard,
  ScreenHeader,
} from '@/components/jorby/screen'
import { SnapshotCard, SnapshotRow } from '@/components/jorby/snapshot-row'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  listDetailPath,
  placeDetailPath,
  thingDetailPath,
  watchDetailPath,
  householdPath,
} from '@/lib/routes'
import { FoundryHome } from '@/osdk/FoundryHome'
import { usesFoundryData } from '@/osdk/household-route'
import { reviewSpread } from '@/prototype/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function HomePage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryHome householdId={householdId} />
  }
  return <PrototypeHome householdId={householdId} />
}

function PrototypeHome({ householdId }: { householdId: string }) {
  const {
    unfinishedLists,
    weShouldPlaces,
    watchTonight,
    wishThings,
    placeReviews,
    places,
    members,
  } = usePrototype()

  const disagreements = Object.entries(placeReviews).filter(
    ([, reviews]) => (reviewSpread(reviews) ?? 0) >= 3,
  )

  // The smart union that makes Jorby different from a generic tracker, so it
  // gets the one saturated card on the screen.
  const weShould = [
    ...weShouldPlaces.map((place) => ({
      key: place.id,
      to: placeDetailPath(householdId, place.id),
      tone: 'places' as const,
      icon: MapPin,
      title: place.name,
      subtitle: `${place.cuisine} · ${place.neighborhood}`,
      tag: 'Want to go',
    })),
    ...watchTonight.map((entry) => ({
      key: entry.id,
      to: watchDetailPath(householdId, entry.id),
      tone: 'watch' as const,
      icon: Clapperboard,
      title: entry.title,
      subtitle: String(entry.year),
      tag: 'Both want it',
    })),
    ...wishThings.map((thing) => ({
      key: thing.id,
      to: thingDetailPath(householdId, thing.id),
      tone: 'things' as const,
      icon: Package,
      title: thing.name,
      subtitle: thing.recipientLabel ? `For ${thing.recipientLabel}` : undefined,
      tag: 'Wish',
    })),
  ]

  return (
    <div>
      <ScreenHeader title="Home" description="What we should do, and what’s still open." />

      <SnapshotRow label="Around the house">
        <SnapshotCard
          to={householdPath(householdId, 'lists')}
          icon={ListTodo}
          tone="lists"
          title="Lists"
          value={String(unfinishedLists.length)}
          hint="open"
        />
        <SnapshotCard
          to={householdPath(householdId, 'notes')}
          icon={StickyNote}
          tone="notes"
          title="Notes"
          value="Mock"
          hint="local only"
        />
        <SnapshotCard
          to={householdPath(householdId, 'places')}
          icon={MapPin}
          tone="places"
          title="Places"
          value={String(weShouldPlaces.length)}
          hint="queued"
        />
        <SnapshotCard
          to={householdPath(householdId, 'watch')}
          icon={Clapperboard}
          tone="watch"
          title="Watch"
          value={String(watchTonight.length)}
          hint="both want"
        />
        <SnapshotCard
          to={householdPath(householdId, 'things')}
          icon={Package}
          tone="things"
          title="Things"
          value={String(wishThings.length)}
          hint="wishes"
        />
      </SnapshotRow>

      <HeroCard eyebrow="We should">
        {weShould.length === 0 ? (
          <p className="text-lg font-semibold text-pretty">
            Nothing queued up. Add a place or a title you both want.
          </p>
        ) : (
          <>
            <Stat value={weShould.length} unit={weShould.length === 1 ? 'idea' : 'ideas'} />
            <p className="mt-1.5 mb-4 text-[0.9375rem] font-medium text-white/85 text-pretty">
              we both said yes to. Start with {weShould[0].title}.
            </p>
            <HeroAction to={weShould[0].to}>
              Open {weShould[0].title}
              <ArrowRight className="size-4" aria-hidden />
            </HeroAction>
          </>
        )}
      </HeroCard>

      <div className="mb-5 flex flex-wrap justify-center gap-2">
        <Button asChild variant="secondary" className="h-11 rounded-full px-5">
          <Link to={householdPath(householdId, 'search')}>Search</Link>
        </Button>
        <Button asChild className="h-11 rounded-full px-5">
          <Link to={householdPath(householdId, 'lists')}>Open lists</Link>
        </Button>
      </div>

      {weShould.length > 0 ? (
        <CardGroup label="What’s queued">
          <RowList>
            {weShould.map((item) => (
              <LinkRow
                key={item.key}
                to={item.to}
                leading={<Tile icon={item.icon} tone={item.tone} />}
                title={item.title}
                subtitle={item.subtitle}
                meta={
                  <Badge variant="secondary" className="rounded-full">
                    {item.tag}
                  </Badge>
                }
              />
            ))}
          </RowList>
        </CardGroup>
      ) : null}

      <CardGroup label="Open lists">
        {unfinishedLists.length === 0 ? (
          <EmptyState>Every list is finished.</EmptyState>
        ) : (
          <RowList>
            {unfinishedLists.map(({ list, remaining }) => (
              <LinkRow
                key={list.id}
                to={listDetailPath(householdId, list.id)}
                leading={<Tile icon={ListTodo} tone="lists" />}
                title={list.name}
                subtitle={list.isPinned ? 'Pinned' : undefined}
                trailing={
                  <span className="text-sm font-semibold tabular-nums">
                    {remaining}
                    <span className="ml-1 font-normal text-muted-foreground">open</span>
                  </span>
                }
              />
            ))}
          </RowList>
        )}
      </CardGroup>

      <CardGroup
        label="We disagree"
        action={<GroupLink to={householdPath(householdId, 'places')}>All places</GroupLink>}
      >
        {disagreements.length === 0 ? (
          <EmptyState>No big rating gaps right now.</EmptyState>
        ) : (
          <RowList>
            {disagreements.map(([placeId, reviews]) => {
              const spread = reviewSpread(reviews) ?? 0
              const place = places.find((entry) => entry.id === placeId)
              return (
                <LinkRow
                  key={placeId}
                  to={placeDetailPath(householdId, placeId)}
                  leading={<Tile icon={Star} tone="places" variant="soft" />}
                  title={place?.name ?? 'Place'}
                  subtitle={`${spread / 2} stars apart`}
                  meta={reviews.map((review) => {
                    const member = members.find((item) => item.id === review.membershipId)
                    if (!member) {
                      return null
                    }
                    return (
                      <span key={review.membershipId} className="inline-flex items-center gap-1">
                        <MemberChip member={member} />
                        <Rating halfStars={review.ratingHalfStars} />
                      </span>
                    )
                  })}
                />
              )
            })}
          </RowList>
        )}
      </CardGroup>

      <p className="px-1 text-xs text-muted-foreground">
        Mock household only. Data resets on reload.
      </p>
    </div>
  )
}
