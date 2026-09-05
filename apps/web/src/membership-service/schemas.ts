import { z } from 'zod'

export const createHouseholdInputSchema = z.object({
  displayName: z.string().min(1),
  defaultCurrency: z.string().length(3),
  timezone: z.string().min(1),
  locale: z.string().min(1),
  homeCity: z.string().optional(),
  homeRegion: z.string().optional(),
  homeCountryCode: z.string().optional(),
})

export const claimInviteInputSchema = z.object({
  token: z.string().min(1),
  profile: z.object({
    displayName: z.string().min(1),
    avatarUrl: z.string().url().nullable(),
    profileColor: z.string().min(1),
  }),
})

export type CreateHouseholdInput = z.infer<typeof createHouseholdInputSchema>
export type ClaimInviteInput = z.infer<typeof claimInviteInputSchema>
