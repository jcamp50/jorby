import { CreditCard, Landmark, PiggyBank, Receipt, Repeat } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup, LinkRow, Row, RowList } from '@/components/jorby/card-group'
import { MemberChip } from '@/components/jorby/member-mark'
import { EmptyState, GroupLink, HeroCard, ScreenHeader } from '@/components/jorby/screen'
import { SnapshotCard, SnapshotRow } from '@/components/jorby/snapshot-row'
import { Tile } from '@/components/jorby/tile'
import { FinanceViewBar, useFinanceView, viewLabel } from '@/finance/FinanceView'
import { LiveFinancePending } from '@/finance/LiveFinancePending'
import { MOCK_NOW, accountKindLabel, accountOwnerLabel, shortDate } from '@/finance/format'
import { Meter } from '@/finance/meter'
import {
  accountsForView,
  budgetSpent,
  monthOutflow,
  ownedForView,
  transactionsForView,
} from '@/finance/model'
import {
  seedFinanceAccounts,
  seedFinanceBudgets,
  seedFinanceGoals,
  seedFinanceSubscriptions,
  seedFinanceTransactions,
} from '@/finance/seed'
import { financePath } from '@/lib/routes'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function FinanceHomePage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <LiveFinancePending householdId={householdId} title="Finance" />
  }
  return <PrototypeFinanceHome householdId={householdId} />
}

function PrototypeFinanceHome({ householdId }: { householdId: string }) {
  const { members } = usePrototype()
  const { view } = useFinanceView()
  const memberById = new Map(members.map((member) => [member.id, member]))
  const accounts = accountsForView(seedFinanceAccounts, view)
  const transactions = transactionsForView(seedFinanceTransactions, view)
  const spent = monthOutflow(transactions, MOCK_NOW)
  const budgets = ownedForView(seedFinanceBudgets, view)
  const goals = ownedForView(seedFinanceGoals, view)
  const bills = ownedForView(seedFinanceSubscriptions, view)
  const who = viewLabel(view, members)
  const tightBudget = [...budgets]
    .map((budget) => ({ budget, spent: budgetSpent(budget, seedFinanceTransactions, MOCK_NOW) }))
    .sort((a, b) => b.spent / b.budget.monthlyLimit - a.spent / a.budget.monthlyLimit)[0]
  const nextBill = [...bills].sort((a, b) => a.nextAt.localeCompare(b.nextAt))[0]
  const recent = [...transactions]
    .filter((tx) => tx.direction === 'out')
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 4)

  return (
    <div>
      <ScreenHeader
        title="Finance"
        description={`${who} view. Accounts, cards, and this month’s spend.`}
      />
      <FinanceViewBar />

      <HeroCard eyebrow={who === 'Household' ? 'This month' : `${who} this month`}>
        <Amount value={spent} currency="USD" size="lg" />
        <p className="mt-2 text-sm text-white/80">Spent on cards and accounts</p>
      </HeroCard>

      <SnapshotRow label="Accounts">
        {accounts.map((account) => (
          <SnapshotCard
            key={account.id}
            to={financePath(householdId, 'activity')}
            icon={account.kind === 'credit' ? CreditCard : account.kind === 'savings' ? PiggyBank : Landmark}
            tone="finance"
            title={account.name}
            value={<Amount value={Math.abs(account.balance)} currency={account.currency} size="sm" />}
            hint={`${accountKindLabel(account.kind)} · ${accountOwnerLabel(account, members)} · ${account.last4}`}
          />
        ))}
      </SnapshotRow>

      {tightBudget ? (
        <CardGroup
          label="Budgets"
          action={<GroupLink to={financePath(householdId, 'budgets')}>All budgets</GroupLink>}
        >
          <Row
            title={tightBudget.budget.name}
            subtitle={`${Math.round((tightBudget.spent / tightBudget.budget.monthlyLimit) * 100)}% of this month’s limit`}
            trailing={
              <Amount value={tightBudget.spent} currency={tightBudget.budget.currency} size="sm" />
            }
          />
          <div className="px-4 pb-4">
            <Meter value={tightBudget.spent} max={tightBudget.budget.monthlyLimit} />
          </div>
        </CardGroup>
      ) : null}

      {goals[0] ? (
        <CardGroup
          label="Goals"
          action={<GroupLink to={financePath(householdId, 'goals')}>All goals</GroupLink>}
        >
          <Row
            title={goals[0].name}
            subtitle={`${Math.round((goals[0].current / goals[0].target) * 100)}% of ${goals[0].target.toLocaleString()}`}
            trailing={<Amount value={goals[0].current} currency={goals[0].currency} size="sm" />}
          />
          <div className="px-4 pb-4">
            <Meter value={goals[0].current} max={goals[0].target} />
          </div>
        </CardGroup>
      ) : null}

      {nextBill ? (
        <CardGroup
          label="Upcoming bill"
          action={<GroupLink to={financePath(householdId, 'bills')}>All bills</GroupLink>}
        >
          <Row
            leading={<Tile icon={Repeat} tone="finance" />}
            title={nextBill.name}
            subtitle={`${shortDate(nextBill.nextAt)} · ${memberById.get(nextBill.paidByMembershipId)?.displayName ?? 'Household'}`}
            trailing={<Amount value={nextBill.amount} currency={nextBill.currency} size="sm" />}
          />
        </CardGroup>
      ) : null}

      <CardGroup
        label="Recent spend"
        action={<GroupLink to={financePath(householdId, 'activity')}>All activity</GroupLink>}
      >
        {recent.length === 0 ? (
          <EmptyState>No card or account spend in this view.</EmptyState>
        ) : (
          <RowList>
            {recent.map((tx) => {
              const member = memberById.get(tx.membershipId)
              return (
                <LinkRow
                  key={tx.id}
                  to={financePath(householdId, 'activity')}
                  leading={<Tile icon={Receipt} tone="finance" />}
                  title={tx.merchant}
                  subtitle={`${tx.category} · ${shortDate(tx.at)}`}
                  trailing={<Amount value={tx.amount} currency={tx.currency} size="sm" />}
                  meta={member ? <MemberChip member={member} /> : undefined}
                />
              )
            })}
          </RowList>
        )}
      </CardGroup>
    </div>
  )
}
