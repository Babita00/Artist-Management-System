import { Router } from 'express'
import { register, login, logout } from '../controllers/auth.controller'
import { isAuthenticated } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { userRegistrationSchema, userLoginSchema } from '../validators/auth.validator'

const router = Router()

// Public route to register a super_admin
router.post('/register', validate(userRegistrationSchema), register)

// Public route to log in all users
router.post('/login', validate(userLoginSchema), login)

// Protected route to log out
router.post('/logout', isAuthenticated, logout)

export default router
