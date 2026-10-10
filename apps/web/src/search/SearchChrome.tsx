import { Check, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { ScreenHeader } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { Input } from '@/components/ui/input'
import { sections, type SectionId } from '@/lib/sections'
import { cn } from '@/lib/utils'

export const searchTypeIds = ['lists', 'notes', 'places', 'watch', 'things'] as const
export type SearchTypeId = (typeof searchTypeIds)[number]

const searchSections = sections.filter((section) =>
  (searchTypeIds as readonly SectionId[]).includes(section.id),
)

export function SearchChrome({
  query,
  onQueryChange,
  selectedTypes,
  onToggleType,
  tags,
  selectedTags,
  onToggleTag,
}: {
  query: string
  onQueryChange: (value: string) => void
  selectedTypes: readonly SearchTypeId[]
  onToggleType: (id: SearchTypeId) => void
  tags: readonly { id: string; label: string }[]
  selectedTags: readonly string[]
  onToggleTag: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedCount = selectedTypes.length + selectedTags.length

  useEffect(() => {
    if (!open) {
      return
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="mb-5">
      <ScreenHeader title="Search" />
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          className="h-13 rounded-full border-0 bg-card pr-14 pl-11 shadow-card"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Lists, notes, places, watch, things"
          aria-label="Search Jorby"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
        />
        <button
          type="button"
          className={cn(
            'absolute top-1/2 right-1.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            open || selectedCount > 0 ? 'bg-muted text-foreground' : 'hover:bg-muted',
          )}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={selectedCount > 0 ? `Filters, ${selectedCount} selected` : 'Filters'}
          onClick={() => setOpen((value) => !value)}
        >
          <SlidersHorizontal className="size-[18px]" />
          {selectedCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
              {selectedCount}
            </span>
          ) : null}
        </button>
      </div>
      {open ? (
        <div id={panelId} className="mt-2 rounded-2xl bg-card p-4 shadow-card">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Type</p>
          <div className="grid grid-cols-5 gap-1">
            {searchSections.map((section) => {
              const active = selectedTypes.includes(section.id as SearchTypeId)
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  data-section={section.id}
                  aria-pressed={active}
                  onClick={() => onToggleType(section.id as SearchTypeId)}
                  className="flex flex-col items-center gap-1.5 rounded-xl py-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {active ? (
                    <Tile icon={Icon} tone={section.id} variant="soft" />
                  ) : (
                    <span
                      aria-hidden
                      className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                    >
                      <Icon className="size-5" strokeWidth={2} />
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-[11px] leading-none',
                      active ? 'font-semibold text-section-ink' : 'text-muted-foreground',
                    )}
                  >
                    {section.label}
                  </span>
                </button>
              )
            })}
          </div>
          {tags.length > 0 ? (
            <div className="mt-4 border-t border-border/70 pt-3">
              <p className="mb-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Tags</p>
              <div>
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onToggleTag(tag.id)}
                      className="flex h-11 w-full items-center gap-3 rounded-xl px-1 text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className={cn('min-w-0 flex-1 truncate text-sm', active ? 'font-semibold' : 'text-muted-foreground')}>
                        #{tag.label}
                      </span>
                      {active ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function toggleId<T extends string>(selected: readonly T[], id: T): T[] {
  return selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
}
