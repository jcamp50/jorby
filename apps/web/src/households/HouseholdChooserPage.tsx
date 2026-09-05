import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Surface } from '@/components/ui/chrome'
import { householdPath } from '@/lib/routes'
import { PROTOTYPE_HOUSEHOLD_ID } from '@/prototype/model'

export function HouseholdChooserPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-medium tracking-tight">Households</h1>
      <p className="text-sm text-muted-foreground">
        Production loads active memberships from Foundry. The prototype has one household.
      </p>
      <Surface className="space-y-3">
        <p className="font-medium">Our Home</p>
        <p className="text-sm text-muted-foreground">Jordan and Sam · New York</p>
        <Button asChild>
          <Link to={householdPath(PROTOTYPE_HOUSEHOLD_ID, 'home')}>Enter</Link>
        </Button>
      </Surface>
    </main>
  )
}
