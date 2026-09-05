import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Member } from '@/prototype/model'

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
    <Avatar size={size} className={className}>
      {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" /> : null}
      <AvatarFallback>{member.initials}</AvatarFallback>
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
