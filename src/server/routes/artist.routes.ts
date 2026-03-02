import { Router } from 'express'
import {
  getAll,
  getById,
  exportCsv,
  importCsv,
  create,
  update,
  remove,
} from '../controllers/artist.controller'
import {
  isAuthenticated,
  isArtistManager,
  isSuperAdminOrArtistManager,
} from '../middlewares/auth.middleware'
import {
  createValidator,
  updateValidator,
  validateArtistId,
} from '../validators/artist.validator'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

router.use(isAuthenticated)

router.get('/', isSuperAdminOrArtistManager, getAll)
router.get('/export', isArtistManager, exportCsv)
router.post('/import', isArtistManager, upload.single('file'), importCsv)

router.get('/:id', isSuperAdminOrArtistManager, validateArtistId, getById)
router.post('/', isArtistManager, createValidator, create)
router.patch('/:id', isArtistManager, updateValidator, update)
router.delete('/:id', isArtistManager, validateArtistId, remove)

export default router
