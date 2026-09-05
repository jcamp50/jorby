import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { householdPath } from '@/lib/routes'
import { PROTOTYPE_HOUSEHOLD_ID } from '@/prototype/model'

export function HouseholdChooserPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Households</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Production loads active memberships from Foundry. The prototype has one household.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Our Home</CardTitle>
          <CardDescription>Jordan and Sam · New York</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="h-12 w-full">
            <Link to={householdPath(PROTOTYPE_HOUSEHOLD_ID, 'home')}>Enter</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
