import { Pool } from 'pg'
import { logger } from '../utils/logger'

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'artist_management',
})

// Test the connection event
pool.on('error', err => {
  logger.error('Unexpected error on idle pg client', err)
  process.exit(-1)
})

export const initDb = async () => {
  const client = await pool.connect()
  try {
    // Enable uuid-ossp extension for gen_random_uuid() or uuid_generate_v4()
    // PostgreSQL 13+ has gen_random_uuid() built-in, but just in case:
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    // Create ENUM types if they don't exist
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('super_admin', 'artist_manager', 'a');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(1) CHECK (gender IN ('M', 'F', 'O')) NOT NULL,
        address TEXT NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
    `)

    // 2. Artists table
    await client.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(1) CHECK (gender IN ('M', 'F', 'O')) NOT NULL,
        address TEXT NOT NULL,
        first_release_year INTEGER NOT NULL,
        no_of_albums_released INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_artists_created_at ON artists(created_at);
      CREATE INDEX IF NOT EXISTS idx_artists_updated_at ON artists(updated_at);
    `)

    // 3. Songs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        album_name VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
      CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);
      CREATE INDEX IF NOT EXISTS idx_songs_updated_at ON songs(updated_at);
    `)

    logger.info('Database schema initialized up successfully.')
  } finally {
    client.release()
  }
}
