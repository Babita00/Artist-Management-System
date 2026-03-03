import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { FALLBACK_ERROR } from '@/constants/messages'

/**
 * Backend response shape:
 *   { success: boolean, message: string }
 *
 * Reads `message` from the response and shows it as a toast.
 * Falls back to FALLBACK_ERROR for network / unknown errors.
 */
export const handleAPIError = (err: unknown): void => {
  if (isAxiosError(err) && err.response?.data?.message) {
    toast.error(err.response.data.message)
    return
  }
  toast.error(FALLBACK_ERROR)
}

/**
 * Same as handleAPIError but also sets react-hook-form field errors
 * when the backend returns `field_errors: { fieldName: string[] }`.
 *
 * Example backend payload for field errors:
 *   { success: false, message: "Validation failed", field_errors: { email: ["Email already exists"] } }
 */
export const handleFormError = <T extends FieldValues>(
  form: UseFormReturn<T>,
  err: unknown
): void => {
  if (!isAxiosError(err) || !err.response) {
    toast.error(FALLBACK_ERROR)
    return
  }

  const { message, field_errors: fieldErrors } = err.response.data

  // Show the top-level message as a toast
  if (message) {
    toast.error(message)
  } else {
    toast.error(FALLBACK_ERROR)
  }

  // If the server returned per-field errors, set them on the form
  if (fieldErrors && typeof fieldErrors === 'object') {
    Object.entries(fieldErrors as Record<string, string[]>).forEach(
      ([field, messages]) => {
        form.setError(field as Path<T>, {
          type: 'server',
          message: Array.isArray(messages) ? messages[0] : String(messages),
        })
      }
    )
  }
}
