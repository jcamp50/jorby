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

/**
 * User-facing copy for each error code. Deliberately vague about whether an
 * inaccessible record exists, so the UI cannot leak another household's data.
 */
const messages: Record<AppErrorCode, string> = {
  AUTH_REQUIRED: 'Sign in again to keep going.',
  ACCESS_DENIED: 'You can’t do that.',
  NOT_FOUND_OR_HIDDEN: 'This isn’t available.',
  VALIDATION_FAILED: 'That didn’t look right. Check it and try again.',
  STALE_REVISION: 'Someone else changed this first. Reload to see their version.',
  LOCKED_BY_OTHER_MEMBER: 'Someone else is editing this right now.',
  LOCK_EXPIRED: 'Your editing lock expired. Reload before saving.',
  DUPLICATE: 'That already exists.',
  PROVIDER_UNAVAILABLE: 'Search is unavailable right now.',
  RATE_LIMITED: 'Too many tries. Wait a moment.',
  NETWORK_UNAVAILABLE: 'You appear to be offline.',
  UNKNOWN: 'Something went wrong.',
}

export function errorMessage(code: AppErrorCode): string {
  return messages[code]
}

/** Whether retrying the same request could plausibly succeed. */
export function isRetryable(code: AppErrorCode): boolean {
  return (
    code === AppErrorCode.NETWORK_UNAVAILABLE ||
    code === AppErrorCode.PROVIDER_UNAVAILABLE ||
    code === AppErrorCode.RATE_LIMITED ||
    code === AppErrorCode.UNKNOWN
  )
}

export type ActionResult = { ok: true } | { ok: false; code: AppErrorCode }

export const actionOk: ActionResult = { ok: true }

export function actionFailed(code: AppErrorCode): ActionResult {
  return { ok: false, code }
}
