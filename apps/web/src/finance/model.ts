export const HOUSEHOLD_VIEW = 'household'

export type FinanceViewId = typeof HOUSEHOLD_VIEW | string

export type AccountKind = 'checking' | 'savings' | 'credit'

export type FinanceAccount = {
  id: string
  name: string
  institution: string
  last4: string
  kind: AccountKind
  ownerMembershipId: typeof HOUSEHOLD_VIEW | string
  balance: number
  currency: string
}

export type FinanceTransaction = {
  id: string
  accountId: string
  merchant: string
  category: string
  amount: number
  direction: 'in' | 'out'
  currency: string
  membershipId: string
  at: string
}

export type FinanceBudget = {
  id: string
  name: string
  category: string
  monthlyLimit: number
  ownerMembershipId: typeof HOUSEHOLD_VIEW | string
  currency: string
}

export type FinanceGoal = {
  id: string
  name: string
  target: number
  current: number
  ownerMembershipId: typeof HOUSEHOLD_VIEW | string
  currency: string
}

export type FinanceSubscription = {
  id: string
  name: string
  amount: number
  cadence: 'monthly' | 'yearly'
  nextAt: string
  paidByMembershipId: string
  ownerMembershipId: typeof HOUSEHOLD_VIEW | string
  currency: string
}

export function inUtcMonth(iso: string, now: Date) {
  const at = new Date(iso)
  return at.getUTCFullYear() === now.getUTCFullYear() && at.getUTCMonth() === now.getUTCMonth()
}

export function monthOutflow(
  transactions: readonly FinanceTransaction[],
  now = new Date(),
): number {
  return transactions
    .filter((tx) => tx.direction === 'out' && inUtcMonth(tx.at, now))
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function budgetSpent(
  budget: FinanceBudget,
  transactions: readonly FinanceTransaction[],
  now = new Date(),
): number {
  return transactions
    .filter(
      (tx) =>
        tx.direction === 'out' &&
        tx.category === budget.category &&
        inUtcMonth(tx.at, now) &&
        (budget.ownerMembershipId === HOUSEHOLD_VIEW || tx.membershipId === budget.ownerMembershipId),
    )
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function accountsForView(
  accounts: readonly FinanceAccount[],
  view: FinanceViewId,
): FinanceAccount[] {
  if (view === HOUSEHOLD_VIEW) {
    return [...accounts]
  }
  return accounts.filter(
    (account) => account.ownerMembershipId === view || account.ownerMembershipId === HOUSEHOLD_VIEW,
  )
}

export function transactionsForView(
  transactions: readonly FinanceTransaction[],
  view: FinanceViewId,
): FinanceTransaction[] {
  if (view === HOUSEHOLD_VIEW) {
    return [...transactions]
  }
  return transactions.filter((tx) => tx.membershipId === view)
}

export function ownedForView<T extends { ownerMembershipId: string }>(
  rows: readonly T[],
  view: FinanceViewId,
): T[] {
  if (view === HOUSEHOLD_VIEW) {
    return [...rows]
  }
  return rows.filter(
    (row) => row.ownerMembershipId === view || row.ownerMembershipId === HOUSEHOLD_VIEW,
  )
}
