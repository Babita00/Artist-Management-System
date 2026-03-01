import { z } from 'zod'

export const artistCreateSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date string' }),
  gender: z.string().refine((val) => ['M', 'F', 'O'].includes(val), {
    message: "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }),
  address: z.string().min(1, 'Address cannot be empty'),
  first_release_year: z.number().int().min(1900).max(new Date().getFullYear()),
  no_of_albums_released: z.number().int().min(0),
})

export const artistUpdateSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid ISO date string' }).optional(),
  gender: z.string().refine((val) => ['M', 'F', 'O'].includes(val), {
    message: "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }).optional(),
  address: z.string().min(1, 'Address cannot be empty').optional(),
  first_release_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  no_of_albums_released: z.number().int().min(0).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})
