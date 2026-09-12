import {
  Clapperboard,
  House,
  ListTodo,
  MapPin,
  Package,
  StickyNote,
  type LucideIcon,
} from 'lucide-react'

/**
 * The six primary sections. `id` doubles as the route segment and as the
 * `data-section` value that selects the hue tokens in index.css.
 */
export type SectionId = 'home' | 'lists' | 'notes' | 'places' | 'watch' | 'things'

export type Section = {
  id: SectionId
  label: string
  icon: LucideIcon
}

export const sections: readonly Section[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'lists', label: 'Lists', icon: ListTodo },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'places', label: 'Places', icon: MapPin },
  { id: 'watch', label: 'Watch', icon: Clapperboard },
  { id: 'things', label: 'Things', icon: Package },
]

const byId = new Map(sections.map((section) => [section.id, section]))

export function getSection(id: SectionId): Section {
  const section = byId.get(id)
  if (!section) {
    throw new Error(`Unknown section: ${id}`)
  }
  return section
}

/**
 * Resolves the hue for a path like `/our-home/places/place-lilia`. Search and
 * settings are not sections of their own, so they inherit Home's hue rather
 * than introducing a seventh colour for two utility screens.
 */
export function sectionFromPath(pathname: string): SectionId {
  const segment = pathname.split('/').filter(Boolean)[1]
  return segment && byId.has(segment as SectionId) ? (segment as SectionId) : 'home'
}
