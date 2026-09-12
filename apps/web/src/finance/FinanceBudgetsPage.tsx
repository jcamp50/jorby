import { useParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup } from '@/components/jorby/card-group'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { FinanceViewBar, useFinanceView, viewLabel } from '@/finance/FinanceView'
import { LiveFinancePending } from '@/finance/LiveFinancePending'
import { MOCK_NOW } from '@/finance/format'
import { Meter } from '@/finance/meter'
import { HOUSEHOLD_VIEW, budgetSpent, ownedForView } from '@/finance/model'
import { seedFinanceBudgets, seedFinanceTransactions } from '@/finance/seed'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function FinanceBudgetsPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <LiveFinancePending householdId={householdId} title="Budgets" />
  }
  return <PrototypeFinanceBudgets />
}

function PrototypeFinanceBudgets() {
  const { members } = usePrototype()
  const { view } = useFinanceView()
  const budgets = ownedForView(seedFinanceBudgets, view)

  return (
    <div>
      <ScreenHeader
        title="Budgets"
        description={`${viewLabel(view, members)} monthly limits.`}
      />
      <FinanceViewBar />
      {budgets.length === 0 ? (
        <EmptyState>No budgets in this view.</EmptyState>
      ) : (
        <CardGroup>
          {budgets.map((budget) => {
            const spent = budgetSpent(budget, seedFinanceTransactions, MOCK_NOW)
            const owner =
              budget.ownerMembershipId === HOUSEHOLD_VIEW
                ? 'Household'
                : members.find((member) => member.id === budget.ownerMembershipId)?.displayName
            return (
              <div key={budget.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-semibold">{budget.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {owner} · {Math.round((spent / budget.monthlyLimit) * 100)}% used
                    </p>
                  </div>
                  <span className="shrink-0 text-right">
                    <Amount value={spent} currency={budget.currency} size="sm" />
                    <span className="block text-xs text-muted-foreground">
                      of {budget.monthlyLimit.toLocaleString()}
                    </span>
                  </span>
                </div>
                <Meter value={spent} max={budget.monthlyLimit} />
              </div>
            )
          })}
        </CardGroup>
      )}
    </div>
  )
}
