import type { JorbyHouseholdMembership } from '@/osdk/resources'
import type { Member, ProfileColor } from '@/prototype/model'

const colors: readonly ProfileColor[] = ['clay', 'sage', 'indigo', 'amber']

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function memberFromMembership(
  membership: JorbyHouseholdMembership.OsdkInstance,
): Member {
  const displayName = membership.displayName?.trim() || 'You'
  const raw = membership.profileColor?.trim().toLowerCase() ?? ''
  const profileColor = colors.includes(raw as ProfileColor) ? (raw as ProfileColor) : 'clay'

  return {
    id: membership.membershipId,
    displayName,
    initials: initialsFrom(displayName),
    profileLabel: displayName,
    profileColor,
    avatarUrl: membership.avatarUrl,
  }
}
