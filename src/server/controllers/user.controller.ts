import { Request, Response } from 'express'
import * as userService from '../services/user.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const getAll = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10
  const result = await userService.getAllUsers(page, limit)
  return successResponse(res, STATUS.OK, 'Users retrieved successfully', result)
}

export const getById = async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string)
  if (!user) {
    return errorResponse(res, STATUS.NOT_FOUND, 'User not found')
  }
  return successResponse(res, STATUS.OK, 'User retrieved successfully', user)
}

export const create = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body)
  return successResponse(res, STATUS.CREATED, 'User created successfully', user)
}

export const update = async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body)
  return successResponse(res, STATUS.OK, 'User updated successfully', user)
}

export const remove = async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id as string)
  return successResponse(res, STATUS.OK, 'User deleted successfully')
}
