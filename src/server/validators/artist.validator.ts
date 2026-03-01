import { z } from 'zod'
import { NextFunction, Request, Response } from 'express'
import { zodErrorMessage } from '../utils/zodErrorMessage'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const uuidSchema = z.object({
  id: z.string().uuid(),
})

export const artistCreateSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be in YYYY-MM-DD format' }),
  gender: z.string().refine((val) => ['M', 'F', 'O'].includes(val), {
    message: "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }),
  address: z.string().min(1, 'Address cannot be empty'),
  first_release_year: z.number().int().min(1900).max(new Date().getFullYear()),
  no_of_albums_released: z.number().int().min(0),
})

export const artistUpdateSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be in YYYY-MM-DD format' }).optional(),
  gender: z.string().refine((val) => val === undefined || ['M', 'F', 'O'].includes(val), {
    message: "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }).optional(),
  address: z.string().min(1, 'Address cannot be empty').optional(),
  first_release_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  no_of_albums_released: z.number().int().min(0).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

export const validateArtistId = (req: Request, res: Response, next: NextFunction) => {
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
  const bodyParsed = await artistCreateSchema.safeParseAsync(req.body)
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

  const bodyParsed = await artistUpdateSchema.safeParseAsync(req.body)
  if (!bodyParsed.success) {
    const returnMessage = zodErrorMessage(bodyParsed)
    return res.status(STATUS.BAD_REQUEST).json({ data: returnMessage })
  }
  next()
}
