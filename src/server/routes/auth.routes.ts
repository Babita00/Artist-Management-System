import { Router } from 'express'
import { register, login, logout } from '../controllers/auth.controller'
import { isAuthenticated } from '../middlewares/auth.middleware'
import { registerValidator, loginValidator } from '../validators/auth.validator'

const router = Router()

// Public route to register a super_admin
router.post('/register', registerValidator, register)

// Public route to log in all users
router.post('/login', loginValidator, login)

// Protected route to log out
router.post('/logout', isAuthenticated, logout)

export default router
