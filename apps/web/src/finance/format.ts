import type { AccountKind, FinanceAccount } from '@/finance/model'
import { HOUSEHOLD_VIEW } from '@/finance/model'

export const MOCK_NOW = new Date('2026-09-06T16:00:00Z')

export function accountKindLabel(kind: AccountKind) {
  if (kind === 'checking') {
    return 'Checking'
  }
  if (kind === 'savings') {
    return 'Savings'
  }
  return 'Card'
}

export function accountOwnerLabel(
  account: FinanceAccount,
  members: readonly { id: string; displayName: string }[],
) {
  if (account.ownerMembershipId === HOUSEHOLD_VIEW) {
    return 'Joint'
  }
  return members.find((member) => member.id === account.ownerMembershipId)?.displayName ?? 'Member'
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
