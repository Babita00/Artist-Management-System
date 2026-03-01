import { Request, Response, NextFunction } from 'express'
import { ObjectSchema } from 'joi'
import { ZodSchema, ZodError } from 'zod'
import { errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const validate = (schema: ObjectSchema | ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ('parse' in schema) {
      try {
        schema.parse(req.body)
        next()
      } catch (error) {
        if (error instanceof ZodError) {
          const errs = (error as any).errors || (error as any).issues || []
          const errorMessage = errs.map((err: any) => err.message).join(', ')
          return errorResponse(res, STATUS.BAD_REQUEST, errorMessage)
        }
        return errorResponse(res, STATUS.BAD_REQUEST, 'Validation error')
      }
    } else {
      const { error } = (schema as ObjectSchema).validate(req.body, { abortEarly: false })

      if (error) {
        // Map Joi's detail array into a single readable string message or array of messages
        const errorMessage = error.details.map((detail) => detail.message).join(', ')
        return errorResponse(res, STATUS.BAD_REQUEST, errorMessage)
      }

      next()
    }
  }
}
