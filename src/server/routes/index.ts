import { Router } from 'express'
import userRoutes from './user.routes'
import artistRoutes from './artist.routes'
import songRoutes from './song.routes'

import authRoutes from './auth.routes'

const router = Router()

router.use('/artists', artistRoutes)
router.use('/auth', authRoutes)
router.use('/songs', songRoutes)
router.use('/users', userRoutes)

export default router
