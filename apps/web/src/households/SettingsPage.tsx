import { Button } from '@/components/ui/button'
import { MemberMark, ScreenHeader, Surface } from '@/components/ui/chrome'
import { usePrototype } from '@/prototype/PrototypeProvider'

export function SettingsPage() {
  const { members, currentMembershipId, setCurrentMember } = usePrototype()

  return (
    <div className="space-y-6">
      <ScreenHeader
        title="Household"
        description="Members are equal. View-as is prototype-only so you can see both voices."
      />
      <Surface className="space-y-3">
        <h2 className="text-sm font-medium">Members</h2>
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                <MemberMark member={member} />
                {member.displayName}
                <span className="text-muted-foreground">({member.profileLabel})</span>
              </span>
              {member.id === currentMembershipId ? (
                <span className="text-xs text-muted-foreground">Viewing as</span>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => setCurrentMember(member.id)}>
                  View as {member.displayName}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Surface>
      <Surface className="space-y-3">
        <h2 className="text-sm font-medium">Invite</h2>
        <p className="text-sm text-muted-foreground">
          Production invites come from the membership service. This copy is a fake link.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigator.clipboard.writeText('https://jorby.local/invite/prototype-token')}
        >
          Copy invite link
        </Button>
      </Surface>
    </div>
  )
}
