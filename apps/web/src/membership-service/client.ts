export const MEMBERSHIP_SERVICE_NOT_CONFIGURED =
  'Membership service is not wired. Set VITE_MEMBERSHIP_SERVICE_URL after the trusted service exists.'

export function membershipServiceBaseUrl(): string | null {
  const value = import.meta.env.VITE_MEMBERSHIP_SERVICE_URL
  if (typeof value !== 'string' || value.length === 0) {
    return null
  }
  return value
}
