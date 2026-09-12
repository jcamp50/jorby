import { getMyMembership, JorbyHouseholdMembership } from '@/osdk/resources'
import { useOsdkFunction, useOsdkObject } from '@osdk/react'

export function useMyMembership(householdId: string) {
  const query = useOsdkFunction(getMyMembership, {
    params: { householdId },
    enabled: householdId !== '',
    dependsOn: [JorbyHouseholdMembership],
  })
  const membershipId = query.data?.$primaryKey ?? ''
  const loaded = useOsdkObject(JorbyHouseholdMembership, membershipId, Boolean(membershipId))

  return {
    data: loaded.object,
    isLoading: query.isLoading || loaded.isLoading,
    error: query.error ?? loaded.error,
  }
}
