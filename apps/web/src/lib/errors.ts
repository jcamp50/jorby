export const AppErrorCode = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  NOT_FOUND_OR_HIDDEN: 'NOT_FOUND_OR_HIDDEN',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  STALE_REVISION: 'STALE_REVISION',
  LOCKED_BY_OTHER_MEMBER: 'LOCKED_BY_OTHER_MEMBER',
  LOCK_EXPIRED: 'LOCK_EXPIRED',
  DUPLICATE: 'DUPLICATE',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  UNKNOWN: 'UNKNOWN',
} as const

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode]

export function normalizeUnknownError(error: unknown): AppErrorCode {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code
    if (typeof code === 'string' && code in AppErrorCode) {
      return code as AppErrorCode
    }
  }
  return AppErrorCode.UNKNOWN
}
