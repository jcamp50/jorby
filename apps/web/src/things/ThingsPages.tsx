import { Gift, Lock, MapPin, Package, Tag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup, Row, RowList, LinkRow } from '@/components/jorby/card-group'
import { MemberMark } from '@/components/jorby/member-mark'
import {
  BackLink,
  EmptyState,
  HeroCard,
  ScreenHeader,
  StickyActions,
} from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toastResult } from '@/lib/action-toast'
import { householdPath, thingDetailPath } from '@/lib/routes'
import { thingLens, type ThingLens } from '@/lib/thing-lifecycle'
import { FoundryCatalogPending } from '@/osdk/FoundryCatalogPending'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

const lenses: ThingLens[] = ['Wish', 'Home', 'History']

const lensIcon = { Wish: Gift, Home: Package, History: Tag } as const

function lifecycleLabel(state: string) {
  return state.replaceAll('_', ' ').toLowerCase()
}

export function ThingsIndexPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return (
      <FoundryCatalogPending
        title="Things"
        body="Things are not in the consumer SDK yet. Reservations stay visible — there is no surprise-gift hiding."
      />
    )
  }
  return <PrototypeThingsIndex householdId={householdId} />
}

function PrototypeThingsIndex({ householdId }: { householdId: string }) {
  const [params, setParams] = useSearchParams()
  const { things } = usePrototype()
  const lens = (
    lenses.includes(params.get('lens') as ThingLens) ? params.get('lens') : 'Wish'
  ) as ThingLens
  const visible = useMemo(
    () => things.filter((thing) => thingLens(thing.lifecycleState) === lens),
    [lens, things],
  )

  return (
    <div>
      <ScreenHeader title="Things" description="One object type. The tab is just a lens." />
      <Tabs value={lens} onValueChange={(value) => setParams({ lens: value })} className="mb-4">
        {/* The default list is h-9; override at the same group-variant specificity so each
            trigger clears a 44px touch target. */}
        <TabsList className="w-full rounded-full bg-card/70 shadow-card backdrop-blur group-data-[orientation=horizontal]/tabs:h-13">
          {lenses.map((item) => (
            <TabsTrigger key={item} value={item} className="flex-1 rounded-full">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {visible.length === 0 ? (
        <EmptyState>Nothing in {lens} yet.</EmptyState>
      ) : (
        <CardGroup>
          <RowList>
            {visible.map((thing) => (
              <LinkRow
                key={thing.id}
                to={thingDetailPath(householdId, thing.id)}
                leading={<Tile icon={lensIcon[lens]} tone="things" />}
                title={thing.name}
                subtitle={thing.recipientLabel ? `For ${thing.recipientLabel}` : undefined}
                meta={
                  <>
                    <Badge variant="secondary" className="rounded-full capitalize">
                      {lifecycleLabel(thing.lifecycleState)}
                    </Badge>
                    {thing.reservedByMembershipId ? (
                      <Badge variant="secondary" className="rounded-full">
                        Reserved
                      </Badge>
                    ) : null}
                  </>
                }
                trailing={
                  thing.priceAmount !== undefined ? (
                    <Amount
                      value={thing.priceAmount}
                      currency={thing.priceCurrency ?? 'USD'}
                      size="sm"
                    />
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

export function ThingDetailPage() {
  const { thingId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return (
      <FoundryCatalogPending
        title="Things"
        body="Things are not in the consumer SDK yet. Reservations stay visible — there is no surprise-gift hiding."
      />
    )
  }
  return <PrototypeThingDetail householdId={householdId} thingId={thingId} />
}

function PrototypeThingDetail({ householdId, thingId }: { householdId: string; thingId: string }) {
  const { things, members, currentMembershipId, reserveThing, releaseThing, purchaseThing } =
    usePrototype()
  const thing = things.find((item) => item.id === thingId)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  if (!thing) {
    return <NotFoundState backTo={householdPath(householdId, 'things')} backLabel="Things" />
  }

  const lens = thingLens(thing.lifecycleState)
  const reserver = members.find((member) => member.id === thing.reservedByMembershipId)
  const canReserve =
    (thing.lifecycleState === 'IDEA' || thing.lifecycleState === 'BUYING') &&
    !thing.reservedByMembershipId
  const canRelease = thing.reservedByMembershipId === currentMembershipId

  const outcomeMessages = {
    OWNED: 'Moved to Home.',
    GIFTED: 'Marked as gifted.',
    BOUGHT: 'Left as bought.',
  }

  function decide(state: 'OWNED' | 'GIFTED' | 'BOUGHT') {
    // The item leaves the current lens, so the outcome needs stating explicitly.
    toastResult(purchaseThing(thingId, state), outcomeMessages[state])
    setPurchaseOpen(false)
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'things')} label="Things" />
      <ScreenHeader title={thing.name} description={thing.notes} />

      <HeroCard eyebrow={thing.priceAmount !== undefined ? 'Price' : lens}>
        {thing.priceAmount !== undefined ? (
          <Amount
            value={thing.priceAmount}
            currency={thing.priceCurrency ?? 'USD'}
            size="lg"
            className="block"
          />
        ) : (
          <p className="text-2xl font-bold tracking-tight capitalize">
            {lifecycleLabel(thing.lifecycleState)}
          </p>
        )}
        <p className="mt-1.5 text-[0.9375rem] font-medium text-white/85 capitalize">
          {lens} · {lifecycleLabel(thing.lifecycleState)}
        </p>
      </HeroCard>

      <CardGroup label="Details">
        <RowList>
          {thing.recipientLabel ? (
            <Row
              leading={<Tile icon={Gift} tone="things" variant="soft" />}
              title="For"
              trailing={<span className="text-sm font-semibold">{thing.recipientLabel}</span>}
            />
          ) : null}
          {thing.storageLocation ? (
            <Row
              leading={<Tile icon={MapPin} tone="things" variant="soft" />}
              title="Lives in"
              trailing={<span className="text-sm font-semibold">{thing.storageLocation}</span>}
            />
          ) : null}
          <Row
            leading={<Tile icon={Package} tone="things" variant="soft" />}
            title="Lifecycle"
            trailing={
              <span className="text-sm font-semibold capitalize">
                {lifecycleLabel(thing.lifecycleState)}
              </span>
            }
          />
        </RowList>
      </CardGroup>

      {reserver ? (
        <CardGroup label="Reservation">
          <Row
            leading={<MemberMark member={reserver} size="default" />}
            title={`Reserved by ${reserver.displayName}`}
            subtitle="Visible to us both — no surprise-gift hiding."
            wrap
            trailing={<Lock className="size-4 text-muted-foreground" aria-hidden />}
          />
        </CardGroup>
      ) : null}

      {canReserve || canRelease || lens === 'Wish' ? (
        <StickyActions>
          <div className="flex flex-col gap-2 sm:flex-row">
            {canReserve ? (
              <Button
                type="button"
                size="lg"
                className="h-11 flex-1 rounded-full"
                onClick={() =>
                  toastResult(reserveThing(thing.id), 'Reserved. The other of us can see this.')
                }
              >
                Reserve
              </Button>
            ) : null}
            {canRelease ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-11 flex-1 rounded-full"
                onClick={() => toastResult(releaseThing(thing.id), 'Reservation released.')}
              >
                Release reservation
              </Button>
            ) : null}
            {lens === 'Wish' ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-11 flex-1 rounded-full"
                onClick={() => setPurchaseOpen(true)}
              >
                Mark purchased
              </Button>
            ) : null}
          </div>
        </StickyActions>
      ) : null}

      <Sheet open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>What happened?</SheetTitle>
            <SheetDescription>
              Purchasing clears the reservation. Pick where {thing.name} goes next.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-full"
              onClick={() => decide('OWNED')}
            >
              Move to Home
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => decide('GIFTED')}
            >
              Mark gifted
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => decide('BOUGHT')}
            >
              Leave as bought
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
