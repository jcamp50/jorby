import { CreditCard, Landmark } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Amount } from '@/components/jorby/amount'
import { CardGroup, Row, RowList } from '@/components/jorby/card-group'
import { MemberChip } from '@/components/jorby/member-mark'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { FinanceViewBar, useFinanceView, viewLabel } from '@/finance/FinanceView'
import { LiveFinancePending } from '@/finance/LiveFinancePending'
import { shortDate } from '@/finance/format'
import { transactionsForView } from '@/finance/model'
import { seedFinanceAccounts, seedFinanceTransactions } from '@/finance/seed'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function FinanceActivityPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <LiveFinancePending householdId={householdId} title="Spend" />
  }
  return <PrototypeFinanceActivity />
}

function PrototypeFinanceActivity() {
  const { members } = usePrototype()
  const { view } = useFinanceView()
  const memberById = new Map(members.map((member) => [member.id, member]))
  const accountById = new Map(seedFinanceAccounts.map((account) => [account.id, account]))
  const rows = [...transactionsForView(seedFinanceTransactions, view)].sort((a, b) =>
    b.at.localeCompare(a.at),
  )

  return (
    <div>
      <ScreenHeader
        title="Spend"
        description={`${viewLabel(view, members)} card and account activity.`}
      />
      <FinanceViewBar />
      {rows.length === 0 ? (
        <EmptyState>No transactions in this view.</EmptyState>
      ) : (
        <CardGroup>
          <RowList>
            {rows.map((tx) => {
              const member = memberById.get(tx.membershipId)
              const account = accountById.get(tx.accountId)
              return (
                <Row
                  key={tx.id}
                  leading={
                    <Tile
                      icon={account?.kind === 'credit' ? CreditCard : Landmark}
                      tone="finance"
                    />
                  }
                  title={tx.merchant}
                  subtitle={`${tx.direction === 'in' ? 'In · ' : ''}${tx.category} · ${account?.name ?? 'Account'} · ${shortDate(tx.at)}`}
                  trailing={<Amount value={tx.amount} currency={tx.currency} size="sm" />}
                  meta={member ? <MemberChip member={member} /> : undefined}
                />
              )
            })}
          </RowList>
        </CardGroup>
      )}
    </div>
  )
}
