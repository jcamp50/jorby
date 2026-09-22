import { Link } from 'react-router-dom'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { Button } from '@/components/ui/button'
import { householdAppsPath } from '@/lib/routes'

export function LiveFinancePending({
  householdId,
  title,
}: {
  householdId: string
  title: string
}) {
  return (
    <div>
      <ScreenHeader title={title} />
      <EmptyState>Finance is not available for this household yet.</EmptyState>
      <Button asChild size="lg" variant="secondary" className="h-11 rounded-full">
        <Link to={householdAppsPath(householdId)}>Back to apps</Link>
      </Button>
    </div>
  )
}
