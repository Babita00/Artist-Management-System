import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { FALLBACK_ERROR } from '@/constants/messages'

export const handleAPIError = (err: unknown): void => {
  console.error(err)
}


export const handleFormError = <T extends FieldValues>(
  form: UseFormReturn<T>,
  err: unknown
): void => {
  if (!isAxiosError(err) || !err.response) {
    toast.error(FALLBACK_ERROR)
    return
  }

  const { field_errors: fieldErrors } = err.response.data

  // The global error toast in axios interceptor will show the top-level message.

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
