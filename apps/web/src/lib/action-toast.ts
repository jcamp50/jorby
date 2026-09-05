import { toast } from 'sonner'
import { errorMessage, type ActionResult } from '@/lib/errors'

/**
 * Announces an action outcome. Pass a success message only when the result is
 * not already obvious on screen; a checkbox that visibly ticks needs no toast.
 */
export function toastResult(result: ActionResult, successMessage?: string): boolean {
  if (result.ok) {
    if (successMessage) {
      toast.success(successMessage)
    }
    return true
  }
  toast.error(errorMessage(result.code))
  return false
}
