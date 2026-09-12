import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { FilterChip, FilterRow } from '@/components/jorby/screen'
import { HOUSEHOLD_VIEW, type FinanceViewId } from '@/finance/model'
import { usePrototype } from '@/prototype/PrototypeProvider'

const FinanceViewContext = createContext<{
  view: FinanceViewId
  setView: (view: FinanceViewId) => void
} | null>(null)

export function FinanceViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<FinanceViewId>(HOUSEHOLD_VIEW)
  const value = useMemo(() => ({ view, setView }), [view])
  return <FinanceViewContext.Provider value={value}>{children}</FinanceViewContext.Provider>
}

export function useFinanceView() {
  const context = useContext(FinanceViewContext)
  if (!context) {
    throw new Error('useFinanceView must be used inside FinanceViewProvider')
  }
  return context
}

export function FinanceViewBar() {
  const { members } = usePrototype()
  const { view, setView } = useFinanceView()

  return (
    <FilterRow label="Money view">
      <FilterChip active={view === HOUSEHOLD_VIEW} onClick={() => setView(HOUSEHOLD_VIEW)}>
        Household
      </FilterChip>
      {members.map((member) => (
        <FilterChip
          key={member.id}
          active={view === member.id}
          onClick={() => setView(member.id)}
        >
          {member.displayName}
        </FilterChip>
      ))}
    </FilterRow>
  )
}

export function viewLabel(view: FinanceViewId, members: readonly { id: string; displayName: string }[]) {
  if (view === HOUSEHOLD_VIEW) {
    return 'Household'
  }
  return members.find((member) => member.id === view)?.displayName ?? 'Member'
}
