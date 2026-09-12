import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Member } from '@/prototype/model'

/**
 * Member identity is carried by colour plus initials, never colour alone. The
 * `data-member-color` attribute selects the pale fill and dark same-hue ink
 * defined in index.css.
 */
export function MemberMark({
  member,
  size = 'sm',
  className,
}: {
  member: Member
  size?: 'sm' | 'default'
  className?: string
}) {
  return (
    <Avatar
      data-member-color={member.profileColor}
      size={size}
      className={cn('bg-member', className)}
    >
      {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" /> : null}
      <AvatarFallback className="bg-member text-[0.8125rem] font-bold text-member-ink">
        {member.initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function MemberTag({ member, className }: { member: Member; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <MemberMark member={member} />
      {member.displayName}
    </span>
  )
}

/**
 * Attribution inside a dense row: the member's colour as a soft pill so it
 * reads at a glance without competing with the row title.
 */
export function MemberChip({ member, label }: { member: Member; label?: string }) {
  return (
    <span
      data-member-color={member.profileColor}
      className="inline-flex items-center gap-1.5 rounded-full bg-member px-2 py-0.5 text-xs font-semibold text-member-ink"
    >
      {label ?? member.displayName}
    </span>
  )
}
