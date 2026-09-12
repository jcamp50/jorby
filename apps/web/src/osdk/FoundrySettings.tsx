import { JorbyHousehold, JorbyHouseholdMembership } from '@/osdk/resources'
import { useOsdkObject, useOsdkObjects } from '@osdk/react'
import { Users } from 'lucide-react'
import { CardGroup, Row, RowList } from '@/components/jorby/card-group'
import { MemberMark } from '@/components/jorby/member-mark'
import { memberFromMembership } from '@/osdk/member'
import { EmptyState, ScreenHeader } from '@/components/jorby/screen'
import { ErrorState } from '@/components/jorby/states'
import { Tile } from '@/components/jorby/tile'
import { AppErrorCode } from '@/lib/errors'

export function FoundrySettings({ householdId }: { householdId: string }) {
  const { object: household } = useOsdkObject(JorbyHousehold, householdId, Boolean(householdId))
  const { data, isLoading, error } = useOsdkObjects(JorbyHouseholdMembership, {
    where: {
      householdId: { $eq: householdId },
    },
    pageSize: 20,
    streamUpdates: true,
    enabled: Boolean(householdId),
  })
  const members = (data ?? []).filter((member) => member.leftAt == null && member.removedAt == null)

  if (error) {
    return <ErrorState code={AppErrorCode.UNKNOWN} />
  }

  return (
    <div>
      <ScreenHeader
        title={household?.displayName ?? 'Household'}
        description="Members come from Foundry. Invites still need the membership service."
      />

      <CardGroup label="Members">
        {isLoading && members.length === 0 ? (
          <EmptyState>Loading members…</EmptyState>
        ) : members.length === 0 ? (
          <EmptyState>No memberships are visible yet.</EmptyState>
        ) : (
          <RowList>
            {members.map((member) => (
              <Row
                key={member.$primaryKey}
                leading={<MemberMark member={memberFromMembership(member)} size="default" />}
                title={member.displayName ?? 'Member'}
                subtitle={member.membershipStatus ?? undefined}
              />
            ))}
          </RowList>
        )}
      </CardGroup>

      <CardGroup label="Invite">
        <Row
          leading={<Tile icon={Users} tone="home" variant="soft" />}
          title="Invite link"
          subtitle="The confidential membership service will mint this. It is not in the consumer SDK."
          wrap
        />
      </CardGroup>
    </div>
  )
}
