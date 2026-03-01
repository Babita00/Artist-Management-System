import { Request, Response } from 'express'
import * as userService from '../services/user.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10
    const result = await userService.getAllUsers(page, limit)
    return successResponse(res, STATUS.OK, 'Users retrieved successfully', result)
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id as string)
    if (!user) {
      return errorResponse(res, STATUS.NOT_FOUND, 'User not found')
    }
    return successResponse(res, STATUS.OK, 'User retrieved successfully', user)
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body)
    return successResponse(res, STATUS.CREATED, 'User created successfully', user)
  } catch (error: any) {
    if (
      error.message === 'Email already in use' ||
      error.message === 'Password is required'
    ) {
      return errorResponse(res, STATUS.BAD_REQUEST, error.message)
    }
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id as string, req.body)
    return successResponse(res, STATUS.OK, 'User updated successfully', user)
  } catch (error: any) {
    if (error.message === 'User not found') {
      return errorResponse(res, STATUS.NOT_FOUND, error.message)
    }
    if (error.message === 'Email already in use by another user') {
      return errorResponse(res, STATUS.BAD_REQUEST, error.message)
    }
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id as string)
    return successResponse(res, STATUS.OK, 'User deleted successfully')
  } catch (error: any) {
    if (error.message === 'User not found') {
      return errorResponse(res, STATUS.NOT_FOUND, error.message)
    }
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}
