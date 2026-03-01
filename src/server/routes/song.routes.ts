import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/song.controller'
import { isAuthenticated, isArtist } from '../middlewares/auth.middleware'
import { createValidator, updateValidator } from '../validators/song.validator'

const router = Router()

// Apply base authentication to all song routes
router.use(isAuthenticated)

// View operations allowed by any authenticated user (super_admin, artist_manager, artist)
router.get('/', getAll)
router.get('/:id', getById)

// Mutate operations explicitly restricted to only 'artist' role
router.post('/', isArtist, createValidator, create)
router.put('/:id', isArtist, updateValidator, update)
router.delete('/:id', isArtist, remove)

export default router
