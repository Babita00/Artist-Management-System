import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerSuperAdmin(req.body)
    return successResponse(res, STATUS.CREATED, 'Super Admin registered successfully', user)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return errorResponse(res, STATUS.BAD_REQUEST, message)
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return errorResponse(res, STATUS.UNAUTHORIZED, message)
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    await authService.logoutUser()
    return successResponse(res, STATUS.OK, 'Logged out successfully')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logout failed'
    return errorResponse(res, STATUS.INTERNAL_SERVER_ERROR, message)
  }
}
