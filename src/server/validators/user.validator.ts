import { z } from 'zod'
import { NextFunction, Request, Response } from 'express'
import { zodErrorMessage } from '../utils/zodErrorMessage'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const uuidSchema = z.object({
  id: z.string().uuid(),
})

export const userCreateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Phone is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be in YYYY-MM-DD format' }),
  gender: z.string().refine((val) => ['M', 'F', 'O'].includes(val), {
    message: "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }),
  address: z.string().min(1, 'Address is required'),
  role: z.string().refine((val) => ['super_admin', 'artist_manager', 'artist'].includes(val), {
    message: 'Invalid role',
  }),
})

export const userUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be in YYYY-MM-DD format' }).optional(),
  gender: z.string().refine((val) => val === undefined || ['M', 'F', 'O'].includes(val), {
    message: "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }).optional(),
  address: z.string().min(1, 'Address is required').optional(),
  role: z.string().refine((val) => val === undefined || ['super_admin', 'artist_manager', 'artist'].includes(val), {
    message: 'Invalid role',
  }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

export const validateUserId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  const idParsed = uuidSchema.safeParse({ id })
  if (!idParsed.success) {
    const returnMessage = zodErrorMessage(idParsed)
    return res.status(STATUS.BAD_REQUEST).json({ data: returnMessage })
  }

  next()
}

export const createValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodyParsed = await userCreateSchema.safeParseAsync(req.body)
  if (!bodyParsed.success) {
    const returnMessage = zodErrorMessage(bodyParsed)
    return res.status(STATUS.BAD_REQUEST).json({ data: returnMessage })
  }
  next()
}

export const updateValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const idParsed = uuidSchema.safeParse({ id })
  if (!idParsed.success) {
    const returnMessage = zodErrorMessage(idParsed)
    return res.status(STATUS.BAD_REQUEST).json({ data: returnMessage })
  }

  const bodyParsed = await userUpdateSchema.safeParseAsync(req.body)
  if (!bodyParsed.success) {
    const returnMessage = zodErrorMessage(bodyParsed)
    return res.status(STATUS.BAD_REQUEST).json({ data: returnMessage })
  }
  next()
}
