import { SectionPlaceholder } from '@/app/shell/SectionPlaceholder'

export function ListsIndexPage() {
  return (
    <SectionPlaceholder
      title="Lists"
      description="Pinned household lists and items. Completing an item must set a desired state, not invert blindly."
    />
  )
}

export function ListDetailPage() {
  return (
    <SectionPlaceholder
      title="List"
      description="Items ordered by rank, optional assignee, archive and restore."
    />
  )
}
