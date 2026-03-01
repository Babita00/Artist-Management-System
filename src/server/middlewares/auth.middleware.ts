import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'
import { errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'
import { Role } from '../../types'

// Extend Express Request object to include the authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * Middleware to authenticate a user via JWT Token present in headers.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, STATUS.UNAUTHORIZED, 'Authentication required. Please provide a Bearer token.')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    req.user = decoded
    next()
  } catch (error) {
    return errorResponse(res, STATUS.UNAUTHORIZED, 'Invalid or expired authentication token.')
  }
}

/**
 * Middleware generator to explicitly block roles that don't match exactly.
 */
const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Note: This relies on isAuthenticated running first to attach req.user
    if (!req.user) {
      return errorResponse(res, STATUS.UNAUTHORIZED, 'Authentication required.')
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return errorResponse(res, STATUS.FORBIDDEN, `Access denied. Requires one of: ${allowedRoles.join(', ')}`)
    }

    next()
  }
}

// Explicit utility middlewares mandated by requirements matrix:
export const isSuperAdmin = authorize(['super_admin'])
export const isArtistManager = authorize(['artist_manager'])
export const isArtist = authorize(['artist'])
export const isSuperAdminOrArtistManager = authorize(['super_admin', 'artist_manager'])
