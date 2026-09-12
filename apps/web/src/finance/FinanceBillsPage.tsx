import { Repeat } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup, Row, RowList } from '@/components/jorby/card-group'
import { MemberChip } from '@/components/jorby/member-mark'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { FinanceViewBar, useFinanceView, viewLabel } from '@/finance/FinanceView'
import { LiveFinancePending } from '@/finance/LiveFinancePending'
import { shortDate } from '@/finance/format'
import { HOUSEHOLD_VIEW, ownedForView } from '@/finance/model'
import { seedFinanceSubscriptions } from '@/finance/seed'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function FinanceBillsPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <LiveFinancePending householdId={householdId} title="Bills" />
  }
  return <PrototypeFinanceBills />
}

function PrototypeFinanceBills() {
  const { members } = usePrototype()
  const { view } = useFinanceView()
  const memberById = new Map(members.map((member) => [member.id, member]))
  const bills = [...ownedForView(seedFinanceSubscriptions, view)].sort((a, b) =>
    a.nextAt.localeCompare(b.nextAt),
  )

  return (
    <div>
      <ScreenHeader
        title="Bills"
        description={`${viewLabel(view, members)} subscriptions and recurring charges.`}
      />
      <FinanceViewBar />
      {bills.length === 0 ? (
        <EmptyState>No bills in this view.</EmptyState>
      ) : (
        <CardGroup>
          <RowList>
            {bills.map((bill) => {
              const payer = memberById.get(bill.paidByMembershipId)
              const scope = bill.ownerMembershipId === HOUSEHOLD_VIEW ? 'Household' : 'Personal'
              return (
                <Row
                  key={bill.id}
                  leading={<Tile icon={Repeat} tone="finance" />}
                  title={bill.name}
                  subtitle={`${scope} · ${bill.cadence} · next ${shortDate(bill.nextAt)}`}
                  trailing={<Amount value={bill.amount} currency={bill.currency} size="sm" />}
                  meta={payer ? <MemberChip member={payer} /> : undefined}
                />
              )
            })}
          </RowList>
        </CardGroup>
      )}
    </div>
  )
}
