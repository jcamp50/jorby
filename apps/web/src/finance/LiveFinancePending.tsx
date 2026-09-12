import { Link } from 'react-router-dom'
import { HeroCard, ScreenHeader } from '@/components/jorby/screen'
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
      <ScreenHeader
        title={title}
        description="This household is live. Finance numbers are still a local prototype."
      />
      <HeroCard eyebrow="Prototype only">
        <p className="text-lg font-semibold text-pretty">
          Accounts, cards, budgets, goals, and bills will show here once money is in the Ontology.
        </p>
      </HeroCard>
      <Button asChild size="lg" variant="secondary" className="h-11 rounded-full">
        <Link to={householdAppsPath(householdId)}>Back to apps</Link>
      </Button>
    </div>
  )
}
