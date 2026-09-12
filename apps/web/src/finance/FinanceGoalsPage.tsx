import { useParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup } from '@/components/jorby/card-group'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { FinanceViewBar, useFinanceView, viewLabel } from '@/finance/FinanceView'
import { LiveFinancePending } from '@/finance/LiveFinancePending'
import { Meter } from '@/finance/meter'
import { HOUSEHOLD_VIEW, ownedForView } from '@/finance/model'
import { seedFinanceGoals } from '@/finance/seed'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function FinanceGoalsPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <LiveFinancePending householdId={householdId} title="Goals" />
  }
  return <PrototypeFinanceGoals />
}

function PrototypeFinanceGoals() {
  const { members } = usePrototype()
  const { view } = useFinanceView()
  const goals = ownedForView(seedFinanceGoals, view)

  return (
    <div>
      <ScreenHeader
        title="Goals"
        description={`${viewLabel(view, members)} saving goals.`}
      />
      <FinanceViewBar />
      {goals.length === 0 ? (
        <EmptyState>No goals in this view.</EmptyState>
      ) : (
        <CardGroup>
          {goals.map((goal) => {
            const owner =
              goal.ownerMembershipId === HOUSEHOLD_VIEW
                ? 'Household'
                : members.find((member) => member.id === goal.ownerMembershipId)?.displayName
            return (
              <div key={goal.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-semibold">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {owner} · {Math.round((goal.current / goal.target) * 100)}%
                    </p>
                  </div>
                  <Amount value={goal.current} currency={goal.currency} size="sm" />
                </div>
                <Meter value={goal.current} max={goal.target} />
                <p className="mt-1 text-xs text-muted-foreground">
                  {goal.target.toLocaleString()} target
                </p>
              </div>
            )
          })}
        </CardGroup>
      )}
    </div>
  )
}
