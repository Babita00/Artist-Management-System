import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/artist.controller'
import { isAuthenticated, isArtistManager, isSuperAdminOrArtistManager } from '../middlewares/auth.middleware'
import { createValidator, updateValidator, validateArtistId } from '../validators/artist.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', isSuperAdminOrArtistManager, getAll)
router.get('/:id', isSuperAdminOrArtistManager, validateArtistId, getById)

router.post('/', isArtistManager, createValidator, create)
router.put('/:id', isArtistManager, updateValidator, update)
router.delete('/:id', isArtistManager, validateArtistId, remove)

export default router
