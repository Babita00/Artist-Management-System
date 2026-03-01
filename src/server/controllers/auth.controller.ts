import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerSuperAdmin(req.body)
    return successResponse(
      res,
      STATUS.CREATED,
      'Super Admin registered successfully',
      user
    )
  } catch (error: any) {
    if (error.message === 'Email already in use' || error.message === 'Password is required') {
      return errorResponse(res, STATUS.BAD_REQUEST, error.message)
    }
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return errorResponse(res, STATUS.BAD_REQUEST, 'Email and password are required')
    }

    const data = await authService.loginUser(email, password)
    return successResponse(res, STATUS.OK, 'Login successful', data)
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      return errorResponse(res, STATUS.UNAUTHORIZED, error.message)
    }
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}

export const logout = async (req: Request, res: Response) => {
  // The client is responsible for deleting the JWT from local storage/cookies
  await authService.logoutUser()
  return successResponse(res, STATUS.OK, 'Logged out successfully')
}
