import { EmptyState, ScreenHeader } from '@/components/jorby/screen'

export function FoundryCatalogPending({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div>
      <ScreenHeader
        title={title}
        description="Live Foundry household. Seeded prototype rows stay on the mock household only."
      />
      <EmptyState>{body}</EmptyState>
    </div>
  )
}
