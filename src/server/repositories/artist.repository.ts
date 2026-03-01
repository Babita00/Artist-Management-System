import { pool } from '../config/database'
import { Artist } from '../../types'

export const countAllArtists = async (): Promise<number> => {
  const countResult = await pool.query('SELECT COUNT(*) FROM artists')
  return parseInt(countResult.rows[0].count, 10)
}

export const findArtistsPaginated = async (limit: number, offset: number): Promise<Artist[]> => {
  const result = await pool.query(
    `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at 
     FROM artists 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  )
  return result.rows
}

export const findArtistById = async (id: string): Promise<Artist | null> => {
  const result = await pool.query(
    `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at 
     FROM artists 
     WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export const createArtistInDb = async (artist: Omit<Artist, 'id' | 'created_at' | 'updated_at'>): Promise<Artist> => {
  const { name, dob, gender, address, first_release_year, no_of_albums_released } = artist
  const result = await pool.query(
    `INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at`,
    [name, dob, gender, address, first_release_year, no_of_albums_released || 0]
  )
  return result.rows[0]
}

export const updateArtistInDb = async (id: string, updateData: Partial<Artist>): Promise<Artist | null> => {
  const fields = []
  const values = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(updateData)) {
    if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      fields.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  }

  if (fields.length === 0) {
    return findArtistById(id)
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const query = `
    UPDATE artists 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
  `

  const result = await pool.query(query, values)
  return result.rows[0] || null
}

export const deleteArtistInDb = async (id: string): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM artists WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}
