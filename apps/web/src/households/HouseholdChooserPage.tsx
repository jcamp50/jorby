import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function HouseholdChooserPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-medium tracking-tight">Households</h1>
      <p className="text-sm text-muted-foreground">
        After login, load active memberships from the Ontology. Zero memberships shows create and claim. One membership
        enters that household. More than one requires selection. Route household IDs are not authorization.
      </p>
      <Button asChild>
        <Link to="/demo-household/home">Open scaffold household</Link>
      </Button>
    </main>
  )
}
