import { describe, expect, it } from 'vitest'
import {
  HOUSEHOLD_VIEW,
  accountsForView,
  budgetSpent,
  monthOutflow,
  transactionsForView,
} from '@/finance/model'
import { seedFinanceAccounts, seedFinanceBudgets, seedFinanceTransactions } from '@/finance/seed'
import { jordan, sam } from '@/prototype/model'

const september = new Date('2026-09-06T16:00:00Z')

describe('monthOutflow', () => {
  it('sums September card and account spend, ignoring income and August', () => {
    expect(monthOutflow(seedFinanceTransactions, september)).toBeCloseTo(621.51, 2)
  })

  it('filters to one member', () => {
    const jordanTx = transactionsForView(seedFinanceTransactions, jordan.id)
    expect(monthOutflow(jordanTx, september)).toBeCloseTo(272.02, 2)
    const samTx = transactionsForView(seedFinanceTransactions, sam.id)
    expect(monthOutflow(samTx, september)).toBeCloseTo(349.49, 2)
  })
})

describe('accountsForView', () => {
  it('keeps joint accounts on a member view', () => {
    const jordanAccounts = accountsForView(seedFinanceAccounts, jordan.id)
    expect(jordanAccounts.some((account) => account.id === 'acct-joint-checking')).toBe(true)
    expect(jordanAccounts.some((account) => account.id === 'acct-sam-card')).toBe(false)
  })
})

describe('budgetSpent', () => {
  it('uses category spend in the month', () => {
    const groceries = seedFinanceBudgets.find((budget) => budget.id === 'bud-groceries')
    expect(groceries).toBeTruthy()
    expect(budgetSpent(groceries!, seedFinanceTransactions, september)).toBe(86.4)
  })
})

describe('household view', () => {
  it('does not hide personal transactions', () => {
    expect(transactionsForView(seedFinanceTransactions, HOUSEHOLD_VIEW)).toHaveLength(
      seedFinanceTransactions.length,
    )
  })
})
