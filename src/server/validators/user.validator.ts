import Joi from 'joi'

export const userCreateSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().required(),
  dob: Joi.date().iso().required(),
  gender: Joi.string().valid('M', 'F', 'O').required().messages({
    'any.only': "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }),
  address: Joi.string().required(),
  role: Joi.string().valid('super_admin', 'artist_manager', 'artist').required(),
})

export const userUpdateSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  phone: Joi.string(),
  dob: Joi.date().iso(),
  gender: Joi.string().valid('M', 'F', 'O').messages({
    'any.only': "Invalid gender provided. Allowed values are 'M', 'F', or 'O'.",
  }),
  address: Joi.string(),
  role: Joi.string().valid('super_admin', 'artist_manager', 'artist'),
}).min(1)
