import { Copy, Users } from 'lucide-react'
import { toast } from 'sonner'
import { CardGroup, Row, RowList } from '@/components/jorby/card-group'
import { MemberMark } from '@/components/jorby/member-mark'
import { ScreenHeader } from '@/components/jorby/screen'
import { Tile } from '@/components/jorby/tile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AppErrorCode, errorMessage } from '@/lib/errors'
import { useParams } from 'react-router-dom'
import { FoundrySettings } from '@/osdk/FoundrySettings'
import { usesFoundryData } from '@/osdk/household-route'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function SettingsPage() {
  const { householdId = '' } = useParams()
  if (usesFoundryData(householdId)) {
    return <FoundrySettings householdId={householdId} />
  }
  return <PrototypeSettings />
}

function PrototypeSettings() {
  const { members, currentMembershipId, setCurrentMember } = usePrototype()

  return (
    <div>
      <ScreenHeader
        title="Household"
        description="Members are equal. View-as is prototype-only so you can see both voices."
      />

      <CardGroup label="Members">
        <RowList>
          {members.map((member) => (
            <Row
              key={member.id}
              leading={<MemberMark member={member} size="default" />}
              title={member.displayName}
              subtitle={member.profileLabel}
              trailing={
                member.id === currentMembershipId ? (
                  <Badge variant="secondary" className="rounded-full">
                    Viewing as
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full"
                    onClick={() => setCurrentMember(member.id)}
                  >
                    View as {member.displayName}
                  </Button>
                )
              }
            />
          ))}
        </RowList>
      </CardGroup>

      <CardGroup label="Invite">
        <Row
          leading={<Tile icon={Users} tone="home" variant="soft" />}
          title="Invite link"
          subtitle="Production invites come from the membership service. This copy is a fake link."
          wrap
        />
        <div className="px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full"
            onClick={() => {
              navigator.clipboard
                .writeText('https://jorby.local/invite/prototype-token')
                .then(() => toast.success('Invite link copied.'))
                .catch(() => toast.error(errorMessage(AppErrorCode.UNKNOWN)))
            }}
          >
            <Copy aria-hidden />
            Copy invite link
          </Button>
        </div>
      </CardGroup>
    </div>
  )
}
