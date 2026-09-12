import type { LucideIcon } from 'lucide-react'
import type { SectionId } from '@/lib/sections'
import { cn } from '@/lib/utils'

export type TileTone = SectionId | 'finance'

/**
 * A tone names a content type, not the current route, so a Place tile looks the
 * same on Home as it does in Places. These reference the `--tone-*` tokens
 * directly rather than `--section`, which follows navigation.
 */
const toneFill: Record<TileTone, string> = {
  home: 'bg-[var(--tone-home)]',
  lists: 'bg-[var(--tone-lists)]',
  notes: 'bg-[var(--tone-notes)]',
  places: 'bg-[var(--tone-places)]',
  watch: 'bg-[var(--tone-watch)]',
  things: 'bg-[var(--tone-things)]',
  finance: 'bg-[var(--tone-finance)]',
}

const toneSoft: Record<TileTone, string> = {
  home: 'bg-[var(--tone-home-wash)] text-[var(--tone-home-ink)]',
  lists: 'bg-[var(--tone-lists-wash)] text-[var(--tone-lists-ink)]',
  notes: 'bg-[var(--tone-notes-wash)] text-[var(--tone-notes-ink)]',
  places: 'bg-[var(--tone-places-wash)] text-[var(--tone-places-ink)]',
  watch: 'bg-[var(--tone-watch-wash)] text-[var(--tone-watch-ink)]',
  things: 'bg-[var(--tone-things-wash)] text-[var(--tone-things-ink)]',
  finance: 'bg-[var(--tone-finance-wash)] text-[var(--tone-finance-ink)]',
}

export function Tile({
  icon: Icon,
  tone,
  variant = 'solid',
  className,
}: {
  icon: LucideIcon
  tone: TileTone
  variant?: 'solid' | 'soft'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-xl',
        variant === 'solid' ? cn(toneFill[tone], 'text-white') : toneSoft[tone],
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={2} />
    </span>
  )
}
