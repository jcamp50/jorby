import { Home, PiggyBank, Receipt, Repeat, Wallet, type LucideIcon } from 'lucide-react'

export type FinanceSectionId = 'overview' | 'activity' | 'budgets' | 'goals' | 'bills'

export type FinanceSectionPath = '' | 'activity' | 'budgets' | 'goals' | 'bills'

export type FinanceSection = {
  id: FinanceSectionId
  label: string
  icon: LucideIcon
  path: FinanceSectionPath
}

export const financeSections: readonly FinanceSection[] = [
  { id: 'overview', label: 'Home', icon: Home, path: '' },
  { id: 'activity', label: 'Spend', icon: Receipt, path: 'activity' },
  { id: 'budgets', label: 'Budgets', icon: Wallet, path: 'budgets' },
  { id: 'goals', label: 'Goals', icon: PiggyBank, path: 'goals' },
  { id: 'bills', label: 'Bills', icon: Repeat, path: 'bills' },
]

export function financeSectionFromPath(pathname: string): FinanceSectionId {
  const segment = pathname.split('/').filter(Boolean)[2]
  const match = financeSections.find((section) => section.path === segment)
  return match?.id ?? 'overview'
}
