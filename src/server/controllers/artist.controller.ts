import { Request, Response } from 'express'
import * as artistService from '../services/artist.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const getAll = async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10
    const result = await artistService.getAllArtists(page, limit)
    return successResponse(res, STATUS.OK, 'Artists retrieved successfully', result)

}

export const getById = async (req: Request, res: Response) => {
    const artist = await artistService.getArtistById(req.params.id as string)
    if (!artist) {
      return errorResponse(res, STATUS.NOT_FOUND, 'Artist not found')
    }
    return successResponse(res, STATUS.OK, 'Artist retrieved successfully', artist)

}

export const create = async (req: Request, res: Response) => {
  try {
    const artist = await artistService.createArtist(req.body)
    return successResponse(res, STATUS.CREATED, 'Artist created successfully', artist)
  } catch (error: any) {
    return errorResponse(
      res,
      STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Internal server error'
    )
  }
}

export const update = async (req: Request, res: Response) => {
    const artist = await artistService.updateArtist(req.params.id as string, req.body)
    return successResponse(res, STATUS.OK, 'Artist updated successfully', artist)

}

export const remove = async (req: Request, res: Response) => {
    await artistService.deleteArtist(req.params.id as string)
    return successResponse(res, STATUS.OK, 'Artist deleted successfully')

}
