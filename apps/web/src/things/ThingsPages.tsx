import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MemberMark, ScreenHeader, Surface } from '@/components/ui/chrome'
import { thingLens, type ThingLens } from '@/lib/thing-lifecycle'
import { thingDetailPath } from '@/lib/routes'
import { usePrototype } from '@/prototype/PrototypeProvider'

const lenses: ThingLens[] = ['Wish', 'Home', 'History']

export function ThingsIndexPage() {
  const { householdId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { things } = usePrototype()
  const lens = (lenses.includes(params.get('lens') as ThingLens) ? params.get('lens') : 'Wish') as ThingLens
  const visible = useMemo(
    () => things.filter((thing) => thingLens(thing.lifecycleState) === lens),
    [lens, things],
  )

  return (
    <div>
      <ScreenHeader title="Things" description="One object type. The tab is just a lens." />
      <div className="mb-4 flex gap-2" role="tablist" aria-label="Thing lens">
        {lenses.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={lens === item}
            className={`min-h-11 flex-1 rounded-md border text-sm ${lens === item ? 'border-foreground bg-muted' : 'border-border'}`}
            onClick={() => setParams({ lens: item })}
          >
            {item}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing in {lens} yet.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((thing) => (
            <li key={thing.id}>
              <Link to={thingDetailPath(householdId, thing.id)}>
                <Surface>
                  <p className="font-medium">{thing.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {thing.lifecycleState.replaceAll('_', ' ').toLowerCase()}
                    {thing.reservedByMembershipId ? ' · Reserved' : ''}
                  </p>
                </Surface>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ThingDetailPage() {
  const { thingId = '', householdId = '' } = useParams()
  const { things, members, currentMembershipId, reserveThing, releaseThing, purchaseThing } = usePrototype()
  const thing = things.find((item) => item.id === thingId)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  if (!thing) {
    return <p className="text-sm text-muted-foreground">This thing isn’t available.</p>
  }

  const reserver = members.find((member) => member.id === thing.reservedByMembershipId)
  const canReserve =
    (thing.lifecycleState === 'IDEA' || thing.lifecycleState === 'BUYING') && !thing.reservedByMembershipId
  const canRelease = thing.reservedByMembershipId === currentMembershipId

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link className="underline" to={`/${householdId}/things`}>
          Things
        </Link>
      </p>
      <ScreenHeader
        title={thing.name}
        description={`${thingLens(thing.lifecycleState)} · ${thing.lifecycleState.replaceAll('_', ' ').toLowerCase()}`}
      />
      {thing.priceLabel ? <p className="text-sm">{thing.priceLabel}</p> : null}
      {thing.recipientLabel ? <p className="text-sm text-muted-foreground">For {thing.recipientLabel}</p> : null}
      {thing.storageLocation ? <p className="text-sm text-muted-foreground">Lives in {thing.storageLocation}</p> : null}
      {thing.notes ? <p className="text-sm">{thing.notes}</p> : null}
      {reserver ? (
        <p className="flex items-center gap-2 text-sm">
          <MemberMark member={reserver} />
          Reserved by {reserver.displayName} (visible to the household)
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canReserve ? (
          <Button type="button" onClick={() => reserveThing(thing.id)}>
            Reserve
          </Button>
        ) : null}
        {canRelease ? (
          <Button type="button" variant="outline" onClick={() => releaseThing(thing.id)}>
            Release reservation
          </Button>
        ) : null}
        {thingLens(thing.lifecycleState) === 'Wish' ? (
          <Button type="button" variant="outline" onClick={() => setPurchaseOpen(true)}>
            Mark purchased
          </Button>
        ) : null}
      </div>
      {purchaseOpen ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4" role="group" aria-label="Purchase outcome">
          <p className="text-sm font-medium">What happened?</p>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => { purchaseThing(thing.id, 'OWNED'); setPurchaseOpen(false) }}>
              Move to Home
            </Button>
            <Button type="button" variant="outline" onClick={() => { purchaseThing(thing.id, 'GIFTED'); setPurchaseOpen(false) }}>
              Mark gifted
            </Button>
            <Button type="button" variant="outline" onClick={() => { purchaseThing(thing.id, 'BOUGHT'); setPurchaseOpen(false) }}>
              Leave as bought
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
