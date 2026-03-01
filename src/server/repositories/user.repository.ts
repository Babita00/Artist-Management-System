import { pool } from '../config/database'
import { User } from '../../types'

export const countAllUsers = async (): Promise<number> => {
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM users'
  )
  return parseInt(countResult.rows[0].count, 10)
}

export const findUsersPaginated = async (
  limit: number,
  offset: number
): Promise<User[]> => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at 
     FROM users 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  )
  return result.rows
}

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at 
     FROM users 
     WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, password, phone, dob, gender, address, role, created_at, updated_at 
     FROM users 
     WHERE email = $1`,
    [email]
  )
  return result.rows[0] || null
}

export const createUserInDb = async (
  user: Omit<User, 'id' | 'created_at' | 'updated_at'>
): Promise<User> => {
  const { first_name, last_name, email, password, phone, dob, gender, address, role } =
    user
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at`,
    [first_name, last_name, email, password, phone, dob, gender, address, role]
  )
  return result.rows[0]
}

export const updateUserInDb = async (
  id: string,
  updateData: Partial<User>
): Promise<User | null> => {
  const fields = []
  const values = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(updateData)) {
    if (
      value !== undefined &&
      key !== 'id' &&
      key !== 'created_at' &&
      key !== 'updated_at'
    ) {
      fields.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  }

  if (fields.length === 0) {
    return findUserById(id)
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
  `

  const result = await pool.query(query, values)
  return result.rows[0] || null
}

export const deleteUserInDb = async (id: string): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1`,
    [id]
  )
  return (result.rowCount ?? 0) > 0
}
