import 'dotenv/config'
import { app } from './app'
import { pool, initDb } from './config/database'
import { logger } from './utils/logger'
import ViteExpress from 'vite-express'

const PORT = parseInt(process.env.PORT || '3000')

async function bootstrap() {
  try {
    // Ensure connection is valid
    const client = await pool.connect()
    client.release()
    const dbName = process.env.DB_DATABASE || 'artist_management'
    logger.info(`Database Connected Successfully! Connected to ${dbName}`)

    // Initialize schema
    await initDb()
  } catch (error) {
    logger.warn('Database connection failed — server will start without DB')
    logger.warn(String(error))
  }

  ViteExpress.listen(app, PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`)
  })
}

bootstrap()
