import { Request, Response } from 'express'
import * as songService from '../services/song.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'

export const getAll = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10
  const artistId = req.query.artist_id as string | undefined

  const result = await songService.getAllSongs(page, limit, artistId)
  return successResponse(res, STATUS.OK, 'Songs retrieved successfully', result)
}

export const getById = async (req: Request, res: Response) => {
  const song = await songService.getSongById(req.params.id as string)
  if (!song) {
    return errorResponse(res, STATUS.NOT_FOUND, 'Song not found')
  }
  return successResponse(res, STATUS.OK, 'Song retrieved successfully', song)
}

export const create = async (req: Request, res: Response) => {
  const song = await songService.createSong(req.body)
  return successResponse(res, STATUS.CREATED, 'Song created successfully', song)
}

export const update = async (req: Request, res: Response) => {
  const song = await songService.updateSong(req.params.id as string, req.body)
  return successResponse(res, STATUS.OK, 'Song updated successfully', song)
}

export const remove = async (req: Request, res: Response) => {
  await songService.deleteSong(req.params.id as string)
  return successResponse(res, STATUS.OK, 'Song deleted successfully')
}
