import jwt from 'jsonwebtoken'
import { User } from '../../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secure-secret-key-123!!'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// Payload that will be encoded in the JWT
export interface JwtPayload {
  id: string
  email: string
  role: string
}

/**
 * Generate a JWT token for a given user
 */
export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any
  })
}

/**
 * Verify a given JWT token and return its payload
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
