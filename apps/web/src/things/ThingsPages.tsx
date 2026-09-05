import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { MemberMark } from '@/components/jorby/member-mark'
import { BackLink, EmptyState, ScreenHeader, SectionHeading } from '@/components/jorby/screen'
import { NotFoundState } from '@/components/jorby/states'
import { toastResult } from '@/lib/action-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { householdPath, thingDetailPath } from '@/lib/routes'
import { thingLens, type ThingLens } from '@/lib/thing-lifecycle'
import { usePrototype } from '@/prototype/PrototypeProvider'

const lenses: ThingLens[] = ['Wish', 'Home', 'History']

export function ThingsIndexPage() {
  const { householdId = '' } = useParams()
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
        <TabsList className="w-full group-data-[orientation=horizontal]/tabs:h-13">
          {lenses.map((item) => (
            <TabsTrigger key={item} value={item} className="flex-1">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {visible.length === 0 ? (
        <EmptyState>Nothing in {lens} yet.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((thing) => (
            <li key={thing.id}>
              <Card className="gap-0 py-0 transition-colors hover:bg-accent/40">
                <Link
                  to={thingDetailPath(householdId, thing.id)}
                  className="flex min-h-16 items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-pretty">{thing.name}</p>
                    {thing.priceLabel ? (
                      <p className="text-sm text-muted-foreground">{thing.priceLabel}</p>
                    ) : null}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="capitalize">
                        {thing.lifecycleState.replaceAll('_', ' ').toLowerCase()}
                      </Badge>
                      {thing.reservedByMembershipId ? (
                        <Badge variant="outline">Reserved</Badge>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ThingDetailPage() {
  const { thingId = '', householdId = '' } = useParams()
  const { things, members, currentMembershipId, reserveThing, releaseThing, purchaseThing } =
    usePrototype()
  const thing = things.find((item) => item.id === thingId)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  if (!thing) {
    return <NotFoundState backTo={householdPath(householdId, 'things')} backLabel="Things" />
  }

  const reserver = members.find((member) => member.id === thing.reservedByMembershipId)
  const canReserve =
    (thing.lifecycleState === 'IDEA' || thing.lifecycleState === 'BUYING') &&
    !thing.reservedByMembershipId
  const canRelease = thing.reservedByMembershipId === currentMembershipId

  const facts = [
    thing.priceLabel ? { label: 'Price', value: thing.priceLabel } : null,
    thing.recipientLabel ? { label: 'For', value: thing.recipientLabel } : null,
    thing.storageLocation ? { label: 'Lives in', value: thing.storageLocation } : null,
  ].filter((fact) => fact !== null)

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

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary">{thingLens(thing.lifecycleState)}</Badge>
        <Badge variant="outline" className="capitalize">
          {thing.lifecycleState.replaceAll('_', ' ').toLowerCase()}
        </Badge>
      </div>

      {facts.length > 0 ? (
        <dl className="mb-6 grid gap-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex gap-2 text-sm">
              <dt className="w-24 shrink-0 text-muted-foreground">{fact.label}</dt>
              <dd className="text-pretty">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {reserver ? (
        <section className="mb-6">
          <SectionHeading>Reservation</SectionHeading>
          <p className="flex min-h-12 items-center gap-2 rounded-lg border px-4 text-sm">
            <MemberMark member={reserver} />
            Reserved by {reserver.displayName}
            <span className="ml-auto text-muted-foreground">visible to us both</span>
          </p>
        </section>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {canReserve ? (
          <Button
            type="button"
            size="lg"
            className="h-12"
            onClick={() => toastResult(reserveThing(thing.id), 'Reserved. The other of us can see this.')}
          >
            Reserve
          </Button>
        ) : null}
        {canRelease ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12"
            onClick={() => toastResult(releaseThing(thing.id), 'Reservation released.')}
          >
            Release reservation
          </Button>
        ) : null}
        {thingLens(thing.lifecycleState) === 'Wish' ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12"
            onClick={() => setPurchaseOpen(true)}
          >
            Mark purchased
          </Button>
        ) : null}
      </div>

      <Sheet open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>What happened?</SheetTitle>
            <SheetDescription>
              Purchasing clears the reservation. Pick where {thing.name} goes next.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button type="button" size="lg" className="h-12" onClick={() => decide('OWNED')}>
              Move to Home
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12"
              onClick={() => decide('GIFTED')}
            >
              Mark gifted
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12"
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
