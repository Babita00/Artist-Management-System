import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const register = async (req: Request, res: Response) => {
  const user = await authService.registerSuperAdmin(req.body)
  return successResponse(
    res,
    STATUS.CREATED,
    'Super Admin registered successfully',
    user
  )
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return errorResponse(res, STATUS.BAD_REQUEST, 'Email and password are required')
  }

  const data = await authService.loginUser(email, password)
  return successResponse(res, STATUS.OK, 'Login successful', data)
}

export const logout = async (req: Request, res: Response) => {
  // The client is responsible for deleting the JWT from local storage/cookies
  await authService.logoutUser()
  return successResponse(res, STATUS.OK, 'Logged out successfully')
}
