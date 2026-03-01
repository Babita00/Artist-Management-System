import Joi from 'joi'

export const userRegistrationSchema = Joi.object({
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
})

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})
