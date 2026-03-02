import { Router } from 'express'
import { register, login, logout } from '../controllers/auth.controller'
import { isAuthenticated } from '../middlewares/auth.middleware'
import { registerValidator, loginValidator } from '../validators/auth.validator'

const router = Router()

router.post('/register', registerValidator, register)

router.post('/login', loginValidator, login)

router.post('/logout', isAuthenticated, logout)

export default router
