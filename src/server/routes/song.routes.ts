import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/song.controller'
import { isAuthenticated, isArtist } from '../middlewares/auth.middleware'
import { createValidator, updateValidator } from '../validators/song.validator'

const router = Router()

router.use(isAuthenticated)

router.get('/', getAll)
router.get('/:id', getById)

router.post('/', isArtist, createValidator, create)
router.patch('/:id', isArtist, updateValidator, update)
router.delete('/:id', isArtist, remove)

export default router
