import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/user.controller'
import { isAuthenticated, isSuperAdmin } from '../middlewares/auth.middleware'
import {
  createValidator,
  updateValidator,
  validateUserId,
} from '../validators/user.validator'

const router = Router()

// All user routes require super_admin access
router.use(isAuthenticated, isSuperAdmin)

router.get('/', getAll)
router.get('/:id', validateUserId, getById)
router.post('/', createValidator, create)
router.patch('/:id', updateValidator, update)
router.delete('/:id', validateUserId, remove)

export default router
