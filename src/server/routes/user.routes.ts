import { Router } from 'express'
import { getAll, getById, create, update, remove } from '../controllers/user.controller'
import { isAuthenticated, isSuperAdmin } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { userCreateSchema, userUpdateSchema } from '../validators/user.validator'

const router = Router()

// All user routes require super_admin access
router.use(isAuthenticated, isSuperAdmin)

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', validate(userCreateSchema), create)
router.patch('/:id', validate(userUpdateSchema), update)
router.delete('/:id', remove)

export default router
