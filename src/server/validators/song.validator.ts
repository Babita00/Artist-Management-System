import Joi from 'joi'

export const songCreateSchema = Joi.object({
  artist_id: Joi.string().uuid().required(),
  title: Joi.string().required(),
  album_name: Joi.string().required(),
  genre: Joi.string().required(),
})

export const songUpdateSchema = Joi.object({
  artist_id: Joi.string().uuid(),
  title: Joi.string(),
  album_name: Joi.string(),
  genre: Joi.string(),
}).min(1)
