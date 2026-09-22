import { Gift, MapPin } from 'lucide-react'
import { type FormEvent, type ReactNode, useState } from 'react'
import { Amount } from '@/components/jorby/amount'
import { MemberMark } from '@/components/jorby/member-mark'
import { BackLink, ScreenHeader, StickyActions } from '@/components/jorby/screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  canReserveThing,
  thingLens,
  thingStatusLine,
  type ThingLifecycleState,
} from '@/lib/thing-lifecycle'
import { householdPath } from '@/lib/routes'
import type { Member } from '@/prototype/model'

export function ThingDetailView({
  householdId,
  name,
  state,
  notes,
  recipientLabel,
  storageLocation,
  price,
  currency,
  photoUrl,
  reservedBy,
  currentMembershipId,
  busy,
  onSaveNotes,
  onReserve,
  onRelease,
  onKeep,
  onGift,
}: {
  householdId: string
  name: string
  state: ThingLifecycleState
  notes?: string
  recipientLabel?: string
  storageLocation?: string
  price?: number
  currency?: string
  photoUrl?: string
  reservedBy?: Member
  currentMembershipId?: string
  busy?: boolean
  onSaveNotes: (notes: string) => void | Promise<void>
  onReserve: () => void | Promise<void>
  onRelease: () => void | Promise<void>
  onKeep: () => void | Promise<void>
  onGift: () => void | Promise<void>
}) {
  const lens = thingLens(state)
  const status = thingStatusLine({
    state,
    reservedByName: reservedBy?.displayName,
    storageLocation,
  })
  const canReserve = canReserveThing(state) && !reservedBy
  const canRelease = Boolean(reservedBy && reservedBy.id === currentMembershipId)
  const wish = lens === 'Wish'
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [draftNotes, setDraftNotes] = useState<string | undefined>(undefined)
  const notesValue = draftNotes ?? notes ?? ''
  const notesDirty = notesValue.trim() !== (notes ?? '').trim()

  async function saveNotes(event: FormEvent) {
    event.preventDefault()
    await onSaveNotes(notesValue.trim())
    setDraftNotes(undefined)
  }

  const facts: { key: string; label: string; value: string; icon: ReactNode }[] = []
  if (recipientLabel) {
    facts.push({
      key: 'for',
      label: 'For',
      value: recipientLabel,
      icon: <Gift className="size-4 text-muted-foreground" aria-hidden />,
    })
  }
  if (storageLocation && lens !== 'Home') {
    facts.push({
      key: 'place',
      label: 'Lives in',
      value: storageLocation,
      icon: <MapPin className="size-4 text-muted-foreground" aria-hidden />,
    })
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'things')} label="Things" />
      <figure className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-section/30 shadow-card">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="size-full object-cover" />
        ) : null}
        {price !== undefined && currency ? (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-4 pt-10">
            <Amount value={price} currency={currency} size="lg" className="block text-white" />
          </div>
        ) : null}
      </figure>
      <ScreenHeader
        title={name}
        description={status}
        action={reservedBy ? <MemberMark member={reservedBy} size="default" /> : undefined}
      />

      {facts.length > 0 ? (
        <dl className="mb-5 space-y-3 px-1">
          {facts.map((fact) => (
            <div key={fact.key} className="flex items-center gap-3">
              {fact.icon}
              <dt className="text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="ml-auto text-sm font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <form onSubmit={(event) => void saveNotes(event)} className="mb-4">
        <Input
          value={notesValue}
          onChange={(event) => setDraftNotes(event.target.value)}
          placeholder="A note for both of you"
          aria-label="Shared notes"
          className="h-11 rounded-full border-0 bg-card shadow-card"
        />
        {notesDirty ? (
          <Button type="submit" variant="secondary" className="mt-2 h-11 w-full rounded-full" disabled={busy}>
            Save note
          </Button>
        ) : null}
      </form>

      {wish ? (
        <StickyActions>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="lg"
              className="h-11 w-full rounded-full"
              disabled={busy}
              onClick={() => setPurchaseOpen(true)}
            >
              We got this
            </Button>
            {canReserve ? (
              <Button
                type="button"
                size="lg"
                variant="ghost"
                className="h-11 w-full rounded-full"
                disabled={busy}
                onClick={() => {
                  void onReserve()
                }}
              >
                I&apos;ll get this
              </Button>
            ) : null}
            {canRelease ? (
              <Button
                type="button"
                size="lg"
                variant="ghost"
                className="h-11 w-full rounded-full"
                disabled={busy}
                onClick={() => {
                  void onRelease()
                }}
              >
                Never mind
              </Button>
            ) : null}
          </div>
        </StickyActions>
      ) : null}

      <Sheet open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Where did it go?</SheetTitle>
            <SheetDescription>
              {name} leaves the wish list. This also clears a reservation.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-full"
              disabled={busy}
              onClick={() => {
                void Promise.resolve(onKeep()).then(() => setPurchaseOpen(false))
              }}
            >
              Keep at home
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 rounded-full"
              disabled={busy}
              onClick={() => {
                void Promise.resolve(onGift()).then(() => setPurchaseOpen(false))
              }}
            >
              Gave it away
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
