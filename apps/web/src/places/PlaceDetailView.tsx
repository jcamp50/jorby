import { Globe, Heart, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { ReviewGroup } from '@/components/jorby/review'
import { BackLink, ScreenHeader } from '@/components/jorby/screen'
import { Button } from '@/components/ui/button'
import { householdPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { Member, MemberReview } from '@/prototype/model'

function hrefForWebsite(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function websiteLabel(value: string) {
  try {
    return new URL(hrefForWebsite(value)).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

export function PlaceDetailView({
  householdId,
  name,
  cuisine,
  neighborhood,
  visitState,
  isFavorite,
  description,
  address,
  phoneNumber,
  websiteUrl,
  photoUrl,
  sharedNote,
  reviews,
  members,
  average,
  spread,
  busy,
  onToggleFavorite,
  children,
}: {
  householdId: string
  name: string
  cuisine?: string
  neighborhood?: string
  visitState?: 'WANT_TO_GO' | 'BEEN' | string | null
  isFavorite: boolean
  description?: string
  address?: string
  phoneNumber?: string
  websiteUrl?: string
  photoUrl?: string
  sharedNote?: string
  reviews: MemberReview[]
  members: Member[]
  average?: number | null
  spread?: number | null
  busy?: boolean
  onToggleFavorite?: () => void
  children?: ReactNode
}) {
  const placeLine = [cuisine, neighborhood].filter(Boolean).join(' · ')
  const visitLabel = visitState === 'WANT_TO_GO' ? 'Want to go' : visitState === 'BEEN' ? 'Been' : undefined
  const facts: { key: string; label: string; value: ReactNode; icon: ReactNode }[] = []
  if (address) {
    facts.push({
      key: 'address',
      label: 'Address',
      value: address,
      icon: <MapPin className="size-4 text-muted-foreground" aria-hidden />,
    })
  }
  if (phoneNumber) {
    facts.push({
      key: 'phone',
      label: 'Phone',
      value: (
        <a href={`tel:${phoneNumber}`} className="hover:underline">
          {phoneNumber}
        </a>
      ),
      icon: <Phone className="size-4 text-muted-foreground" aria-hidden />,
    })
  }
  if (websiteUrl) {
    facts.push({
      key: 'website',
      label: 'Website',
      value: (
        <a href={hrefForWebsite(websiteUrl)} target="_blank" rel="noreferrer" className="hover:underline">
          {websiteLabel(websiteUrl)}
        </a>
      ),
      icon: <Globe className="size-4 text-muted-foreground" aria-hidden />,
    })
  }

  return (
    <div>
      <BackLink to={householdPath(householdId, 'places')} label="Places" />
      <figure className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-section/30 shadow-card">
        {photoUrl ? <img src={photoUrl} alt="" className="size-full object-cover" /> : null}
      </figure>
      <ScreenHeader
        title={name}
        description={placeLine || undefined}
        action={
          onToggleFavorite ? (
            <Button
              type="button"
              size="icon-lg"
              variant="ghost"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="rounded-full"
              disabled={busy}
              onClick={onToggleFavorite}
            >
              <Heart
                className={cn('size-5', isFavorite ? 'fill-current text-section' : 'text-muted-foreground')}
                aria-hidden
              />
            </Button>
          ) : undefined
        }
      />
      {visitLabel ? (
        <p className="mb-4 -mt-3 px-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {visitLabel}
        </p>
      ) : null}

      {description ? (
        <p className="mb-5 px-1 text-[0.9375rem] leading-relaxed text-pretty">{description}</p>
      ) : null}

      {facts.length > 0 ? (
        <dl className="mb-5 space-y-3 px-1">
          {facts.map((fact) => (
            <div key={fact.key} className="flex items-start gap-3">
              <span className="mt-0.5">{fact.icon}</span>
              <dt className="sr-only">{fact.label}</dt>
              <dd className="text-sm font-medium text-pretty">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {sharedNote ? (
        <p className="mb-5 px-1 text-sm text-muted-foreground text-pretty">{sharedNote}</p>
      ) : null}

      <ReviewGroup
        reviews={reviews}
        members={members}
        average={average}
        note={
          spread != null && spread >= 3 ? `We are ${spread / 2} stars apart on this one.` : undefined
        }
        emptyMessage="Neither of us has reviewed this yet."
      />

      {children}
    </div>
  )
}
