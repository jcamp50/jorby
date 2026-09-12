import { isFoundryConfigured } from '@/osdk/client'
import { PROTOTYPE_HOUSEHOLD_ID } from '@/prototype/model'

export function usesFoundryData(householdId: string) {
  return isFoundryConfigured() && householdId !== PROTOTYPE_HOUSEHOLD_ID
}
