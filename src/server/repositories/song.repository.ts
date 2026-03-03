import { pool } from '../config/database'
import { Song } from '../../types'

export const countSongs = async (artistId?: string): Promise<number> => {
  let countQuery = 'SELECT COUNT(*) FROM songs'
  const countValues: any[] = []

  if (artistId) {
    countQuery += ' WHERE artist_id = $1'
    countValues.push(artistId)
  }

  const countResult = await pool.query(countQuery, countValues)
  return parseInt(countResult.rows[0].count, 10)
}

export const findSongsPaginated = async (limit: number, offset: number, artistId?: string): Promise<Song[]> => {
  let dataQuery = `SELECT id, artist_id, title, album_name, genre, created_at, updated_at 
                   FROM songs`
  const dataValues: any[] = [limit, offset] 
  if (artistId) {
    dataQuery += ' WHERE artist_id = $3'
    dataValues.push(artistId) // $3 = artistId
  }

  dataQuery += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`

  const result = await pool.query(dataQuery, dataValues)
  return result.rows
}

export const findSongById = async (id: string): Promise<Song | null> => {
  const result = await pool.query(
    `SELECT id, artist_id, title, album_name, genre, created_at, updated_at 
     FROM songs 
     WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export const createSongInDb = async (song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<Song> => {
  const { artist_id, title, album_name, genre } = song
  const result = await pool.query(
    `INSERT INTO songs (artist_id, title, album_name, genre)
     VALUES ($1, $2, $3, $4)
     RETURNING id, artist_id, title, album_name, genre, created_at, updated_at`,
    [artist_id, title, album_name, genre]
  )
  return result.rows[0]
}

export const updateSongInDb = async (id: string, updateData: Partial<Song>): Promise<Song | null> => {
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
    return findSongById(id)
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const query = `
    UPDATE songs 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, artist_id, title, album_name, genre, created_at, updated_at
  `

  const result = await pool.query(query, values)
  return result.rows[0] || null
}

export const deleteSongInDb = async (id: string): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM songs WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}
