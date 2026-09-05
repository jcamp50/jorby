import { Copy } from 'lucide-react'
import { MemberMark } from '@/components/jorby/member-mark'
import { ScreenHeader, SectionHeading } from '@/components/jorby/screen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function SettingsPage() {
  const { members, currentMembershipId, setCurrentMember } = usePrototype()

  return (
    <div className="space-y-8">
      <ScreenHeader
        title="Household"
        description="Members are equal. View-as is prototype-only so you can see both voices."
      />

      <section>
        <SectionHeading>Members</SectionHeading>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex min-h-14 flex-wrap items-center gap-3 rounded-lg border px-4 py-2"
            >
              <MemberMark member={member} size="default" />
              <span className="min-w-0">
                <span className="block font-medium">{member.displayName}</span>
                <span className="block text-sm text-muted-foreground">{member.profileLabel}</span>
              </span>
              {member.id === currentMembershipId ? (
                <Badge variant="secondary" className="ml-auto">
                  Viewing as
                </Badge>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto h-11"
                  onClick={() => setCurrentMember(member.id)}
                >
                  View as {member.displayName}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading>Invite</SectionHeading>
        <Card>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-pretty">
              Production invites come from the membership service. This copy is a fake link.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full sm:w-auto"
              onClick={() =>
                void navigator.clipboard.writeText('https://jorby.local/invite/prototype-token')
              }
            >
              <Copy aria-hidden />
              Copy invite link
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
