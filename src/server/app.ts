import express from 'express'
import cors from 'cors'
import routes from './routes'
import { logger } from './utils/logger'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/v1', routes)

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(err.stack || err.message || err)
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
    })
  }
)

export { app }
