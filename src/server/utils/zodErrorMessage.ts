import { z } from 'zod'

export const zodErrorMessage = (parsedError: { success: false; error: z.ZodError<any> }): string => {
  if (parsedError.error && parsedError.error.issues.length > 0) {
    return parsedError.error.issues.map((issue: z.ZodIssue) => issue.message).join(', ')
  }
  return 'Validation failed'
}
