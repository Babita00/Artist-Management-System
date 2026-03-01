import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/artist.controller'
import { isAuthenticated, isArtistManager, isSuperAdminOrArtistManager } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { artistCreateSchema, artistUpdateSchema } from '../validators/artist.validator'

const router = Router()

// Apply base authentication to all artist routes
router.use(isAuthenticated)

// View operations allowed by super_admin OR artist_manager
router.get('/', isSuperAdminOrArtistManager, getAll)
router.get('/:id', isSuperAdminOrArtistManager, getById)

// Mutate operations strictly restricted to artist_manager
router.post('/', isArtistManager, validate(artistCreateSchema), create)
router.put('/:id', isArtistManager, validate(artistUpdateSchema), update)
router.delete('/:id', isArtistManager, remove)

export default router
