import { z } from 'zod'
import { NextFunction, Request, Response } from 'express'
import { zodErrorMessage } from '../utils/zodErrorMessage'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const uuidSchema = z.object({
  id: z.string().uuid(),
})

export const songCreateSchema = z.object({
  artist_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  album_name: z.string().min(1, 'Album name is required'),
  genre: z.string().min(1, 'Genre is required'),
})

export const songUpdateSchema = z.object({
  artist_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').optional(),
  album_name: z.string().min(1, 'Album name is required').optional(),
  genre: z.string().min(1, 'Genre is required').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

export const createValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodyParsed = await songCreateSchema.safeParseAsync(req.body)
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

  const bodyParsed = await songUpdateSchema.safeParseAsync(req.body)
  if (!bodyParsed.success) {
    const returnMessage = zodErrorMessage(bodyParsed)
    return res.status(STATUS.BAD_REQUEST).json({ data: returnMessage })
  }
  next()
}
