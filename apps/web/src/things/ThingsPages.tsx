import { Gift, Package, Tag } from 'lucide-react'
import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup, RowList, LinkRow } from '@/components/jorby/card-group'
import { ThingCreate } from '@/components/jorby/create/forms'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { SectionTabs } from '@/components/jorby/section-tabs'
import { NotFoundState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { toastResult } from '@/lib/action-toast'
import { householdPath, thingDetailPath } from '@/lib/routes'
import { thingLens, type ThingLens } from '@/lib/thing-lifecycle'
import { FoundryThingDetail, FoundryThingsIndex } from '@/osdk/FoundryThings'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'
import { ThingDetailView } from '@/things/ThingDetailView'

const lenses: ThingLens[] = ['Wish', 'Home', 'History']

const lensIcon = { Wish: Gift, Home: Package, History: Tag } as const

function lifecycleLabel(state: string) {
  return state.replaceAll('_', ' ').toLowerCase()
}

export function ThingsIndexPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryThingsIndex householdId={householdId} />
  }
  return <PrototypeThingsIndex householdId={householdId} />
}

function PrototypeThingsIndex({ householdId }: { householdId: string }) {
  const [params, setParams] = useSearchParams()
  const { things, members, createThing } = usePrototype()
  const lens = (
    lenses.includes(params.get('lens') as ThingLens) ? params.get('lens') : 'Wish'
  ) as ThingLens
  const visible = useMemo(
    () => things.filter((thing) => thingLens(thing.lifecycleState) === lens),
    [lens, things],
  )

  return (
    <div>
      <ScreenHeader title="Things" />
      <SectionTabs
        label="Thing lens"
        value={lens}
        onValueChange={(value) => setParams({ lens: value })}
        options={lenses.map((item) => ({ value: item, label: item }))}
      />
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
      <ThingCreate
        defaultLens={lens === 'Home' ? 'Home' : 'Wish'}
        members={members}
        onCreate={(input) =>
          toastResult(
            createThing(input.name, {
              lifecycleState: input.lens === 'Home' ? 'OWNED' : 'IDEA',
              priceAmount: input.priceAmount,
              recipientLabel: input.recipientLabel,
              notes: input.notes,
              tags: input.tags,
              photoUrl: input.photo?.previewUrl,
            }),
          )
        }
      />
    </div>
  )
}

export function ThingDetailPage() {
  const { thingId = '', householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundryThingDetail householdId={householdId} thingId={thingId} />
  }
  return <PrototypeThingDetail householdId={householdId} thingId={thingId} />
}

function PrototypeThingDetail({ householdId, thingId }: { householdId: string; thingId: string }) {
  const { things, members, currentMembershipId, reserveThing, releaseThing, purchaseThing, saveThingNotes } =
    usePrototype()
  const thing = things.find((item) => item.id === thingId)

  if (!thing) {
    return <NotFoundState backTo={householdPath(householdId, 'things')} backLabel="Things" />
  }

  const reserver = members.find((member) => member.id === thing.reservedByMembershipId)

  return (
    <ThingDetailView
      householdId={householdId}
      name={thing.name}
      state={thing.lifecycleState}
      notes={thing.notes}
      recipientLabel={thing.recipientLabel}
      storageLocation={thing.storageLocation}
      price={thing.priceAmount}
      currency={thing.priceCurrency}
      photoUrl={
        thing.photoUrl ?? `https://picsum.photos/seed/${encodeURIComponent(thing.id)}/1200/900`
      }
      reservedBy={reserver}
      currentMembershipId={currentMembershipId}
      onSaveNotes={(notes) => {
        toastResult(saveThingNotes(thingId, notes), 'Saved.')
      }}
      onReserve={() => {
        toastResult(reserveThing(thing.id), 'You are getting this.')
      }}
      onRelease={() => {
        toastResult(releaseThing(thing.id), 'Reservation cleared.')
      }}
      onKeep={() => {
        toastResult(purchaseThing(thingId, 'OWNED'), 'Moved to Home.')
      }}
      onGift={() => {
        toastResult(purchaseThing(thingId, 'GIFTED'), 'Marked as given away.')
      }}
    />
  )
}
