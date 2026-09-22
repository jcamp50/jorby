import {
  createJorbyThing,
  JorbyHousehold,
  JorbyHouseholdMembership,
  JorbyThing,
  manageJorbyThingDetails,
  manageJorbyThingLifecycle,
  manageJorbyThingReservation,
} from '@/osdk/resources'
import { useOsdkAction, useOsdkObject, useOsdkObjects } from '@osdk/react'
import { Gift, Package, Tag } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup, LinkRow, RowList } from '@/components/jorby/card-group'
import { ThingCreate } from '@/components/jorby/create/forms'
import {
  EmptyState,
  ScreenHeader,
} from '@/components/jorby/screen'
import { SectionTabs } from '@/components/jorby/section-tabs'
import { ErrorState, NotFoundState, RefreshingBanner } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { AppErrorCode } from '@/lib/errors'
import { minorUnitsToMajor } from '@/lib/price'
import { householdPath, thingDetailPath } from '@/lib/routes'
import {
  lifecycleLabel,
  thingLens,
  type ThingLens,
  type ThingLifecycleState,
} from '@/lib/thing-lifecycle'
import {
  thingDetailsOperation,
  thingLifecycleOperation,
  thingReservationOperation,
} from '@/osdk/operations'
import { memberFromMembership } from '@/osdk/member'
import { ThingDetailView } from '@/things/ThingDetailView'
import { useMyMembership } from '@/osdk/useMyMembership'
import { toast } from 'sonner'

const lenses: ThingLens[] = ['Wish', 'Home', 'History']
const lensIcon = { Wish: Gift, Home: Package, History: Tag } as const

export function FoundryThingsIndex({ householdId }: { householdId: string }) {
  const [params, setParams] = useSearchParams()
  const { object: household, isLoading: householdLoading } = useOsdkObject(
    JorbyHousehold,
    householdId,
    Boolean(householdId),
  )
  const { data, isLoading, error } = useOsdkObjects(JorbyThing, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    orderBy: { updatedAt: 'desc' },
    pageSize: 50,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const create = useOsdkAction(createJorbyThing)
  const members = useOsdkObjects(JorbyHouseholdMembership, {
    where: { householdId: { $eq: householdId } },
    pageSize: 20,
    enabled: Boolean(householdId),
  })
  const lens = (
    lenses.includes(params.get('lens') as ThingLens) ? params.get('lens') : 'Wish'
  ) as ThingLens
  const things = data ?? []
  const visible = useMemo(
    () =>
      things.filter((thing) =>
        thing.lifecycleState ? thingLens(thing.lifecycleState as ThingLifecycleState) === lens : false,
      ),
    [lens, things],
  )

  async function onCreate(name: string, lifecycleState: 'IDEA' | 'OWNED') {
    if (!household || name.trim() === '') {
      return false
    }
    try {
      await create.applyAction({
        household,
        name: name.trim(),
        lifecycleState,
      })
      return true
    } catch {
      toast.error('The thing could not be created.')
      return false
    }
  }

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <div>
      <ScreenHeader title="Things" />
      <SectionTabs
        label="Thing lens"
        value={lens}
        onValueChange={(value) => setParams({ lens: value })}
        options={lenses.map((item) => ({ value: item, label: item }))}
      />
      {isLoading && things.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading things…</p>
      ) : visible.length === 0 ? (
        <EmptyState>Nothing in {lens} yet.</EmptyState>
      ) : (
        <>
          {isLoading ? <RefreshingBanner /> : null}
          <CardGroup>
            <RowList>
              {visible.map((thing) => (
                <LinkRow
                  key={thing.$primaryKey}
                  to={thingDetailPath(householdId, thing.thingId)}
                  leading={<Tile icon={lensIcon[lens]} tone="things" />}
                  title={thing.name ?? 'Untitled'}
                  subtitle={thing.externalRecipientLabel ? `For ${thing.externalRecipientLabel}` : undefined}
                  meta={
                    <>
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {lifecycleLabel(String(thing.lifecycleState ?? ''))}
                      </Badge>
                      {thing.reservedByMembershipId ? (
                        <Badge variant="secondary" className="rounded-full">
                          Reserved
                        </Badge>
                      ) : null}
                    </>
                  }
                  trailing={
                    thing.priceMinorUnits != null && thing.priceCurrency ? (
                      <Amount
                        value={minorUnitsToMajor(thing.priceMinorUnits, thing.priceCurrency)}
                        currency={thing.priceCurrency}
                        size="sm"
                      />
                    ) : undefined
                  }
                />
              ))}
            </RowList>
          </CardGroup>
        </>
      )}

      <ThingCreate
        defaultLens={lens === 'Home' ? 'Home' : 'Wish'}
        members={(members.data ?? []).map(memberFromMembership)}
        busy={create.isPending || householdLoading || !household}
        onCreate={(input) => onCreate(input.name, input.lens === 'Home' ? 'OWNED' : 'IDEA')}
      />
    </div>
  )
}

export function FoundryThingDetail({
  householdId,
  thingId,
}: {
  householdId: string
  thingId: string
}) {
  const { object: thing, isLoading, error } = useOsdkObject(JorbyThing, thingId, Boolean(thingId))
  const me = useMyMembership(householdId)
  const members = useOsdkObjects(JorbyHouseholdMembership, {
    where: {
      householdId: { $eq: householdId },
      archivedAt: { $isNull: true },
    },
    pageSize: 50,
    enabled: Boolean(householdId),
  })
  const details = useOsdkAction(manageJorbyThingDetails)
  const lifecycle = useOsdkAction(manageJorbyThingLifecycle)
  const reservation = useOsdkAction(manageJorbyThingReservation)
  const busy = details.isPending || lifecycle.isPending || reservation.isPending

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }
  if (isLoading && !thing) {
    return <p className="text-sm text-muted-foreground">Loading thing…</p>
  }
  if (!thing || thing.householdId !== householdId) {
    return <NotFoundState backTo={householdPath(householdId, 'things')} backLabel="Things" />
  }

  const state = (thing.lifecycleState ?? 'IDEA') as ThingLifecycleState
  const reservedBy = (members.data ?? [])
    .map(memberFromMembership)
    .find((member) => member.id === thing.reservedByMembershipId)
  const price =
    thing.priceMinorUnits != null && thing.priceCurrency
      ? minorUnitsToMajor(thing.priceMinorUnits, thing.priceCurrency)
      : undefined

  async function onLifecycle(lifecycleState: ThingLifecycleState) {
    if (!thing || thing.revision == null) {
      return
    }
    try {
      await lifecycle.applyAction({
        thing,
        expectedRevision: thing.revision,
        operation: thingLifecycleOperation.setState,
        lifecycleState,
      })
    } catch {
      toast.error('Could not update this thing.')
    }
  }

  async function onReserve(isReserved: boolean) {
    if (!thing || thing.revision == null) {
      return
    }
    try {
      await reservation.applyAction({
        thing,
        expectedRevision: thing.revision,
        operation: isReserved
          ? thingReservationOperation.reserve
          : thingReservationOperation.release,
      })
    } catch {
      toast.error('Could not update the reservation.')
    }
  }

  async function onSaveNotes(nextNotes: string) {
    if (!thing || thing.revision == null) {
      return
    }
    try {
      await details.applyAction({
        thing,
        expectedRevision: thing.revision,
        operation: thingDetailsOperation.save,
        notes: nextNotes === '' ? undefined : nextNotes,
      })
    } catch {
      toast.error('Could not save the note.')
    }
  }

  return (
    <ThingDetailView
      householdId={householdId}
      name={thing.name ?? 'Untitled'}
      state={state}
      notes={thing.notes ?? undefined}
      recipientLabel={thing.externalRecipientLabel ?? undefined}
      storageLocation={thing.storageLocation ?? undefined}
      price={price}
      currency={thing.priceCurrency ?? undefined}
      reservedBy={reservedBy}
      currentMembershipId={me.data?.membershipId}
      busy={busy}
      onSaveNotes={onSaveNotes}
      onReserve={() => onReserve(true)}
      onRelease={() => onReserve(false)}
      onKeep={() => onLifecycle('OWNED')}
      onGift={() => onLifecycle('GIFTED')}
    />
  )
}
