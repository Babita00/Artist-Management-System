import express from 'express'
import cors from 'cors'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// TODO: Register TSOA routes
// TODO: Error handling middleware

export { app }
