import express from 'express'
import cors from 'cors'
import routes from './routes'
import { logger } from './utils/logger'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/v1', routes)

export { app }
