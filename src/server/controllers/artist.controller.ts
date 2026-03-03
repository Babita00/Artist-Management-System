import { Request, Response } from 'express'
import * as artistService from '../services/artist.service'
import { successResponse, errorResponse } from '../utils/response'
import { HttpStatusCodes as STATUS } from '../constants/httpStatusCodes'
import ExcelJS from 'exceljs'
import { artistCreateSchema } from '../validators/artist.validator'
import { Readable } from 'stream'

export const getAll = async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10
  const result = await artistService.getAllArtists(page, limit)
  return successResponse(res, STATUS.OK, 'Artists retrieved successfully', result)
}

export const exportCsv = async (req: Request, res: Response) => {
  const artists = await artistService.getAllArtistsExport()

  // Create ExcelJS workbook and worksheet for CSV Export
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Artists')

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Date of Birth', key: 'dob', width: 15 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'First Release Year', key: 'first_release_year', width: 15 },
    { header: 'Albums Released', key: 'no_of_albums_released', width: 15 },
  ]

  artists.forEach(artist => {
    worksheet.addRow(artist)
  })

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=artists_export.csv')

  await workbook.csv.write(res)
  res.end()
}

export const importCsv = async (req: Request, res: Response) => {
  if (!req.file) {
    return errorResponse(res, STATUS.BAD_REQUEST, 'No file uploaded')
  }

  const workbook = new ExcelJS.Workbook()
  const stream = Readable.from(req.file.buffer)
  await workbook.csv.read(stream)
  const worksheet = workbook.worksheets[0]

  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber)
    if (!row.hasValues) continue

    const rowValues = row.values as any[]

    // CSV column order: Artist Name | Date of Birth | Gender | First Release | Albums | Location
    try {
      const artistData = {
        name: rowValues[1]?.toString().trim(),
        dob: new Date(rowValues[2]).toISOString().split('T')[0],
        gender: rowValues[3]?.toString().trim() === 'Female' ? 'F'
              : rowValues[3]?.toString().trim() === 'Male' ? 'M' : 'O',
        first_release_year: parseInt(rowValues[4], 10),
        no_of_albums_released: parseInt(rowValues[5], 10),
        address: rowValues[6]?.toString().trim() ?? '',
      }

      const parsedData = artistCreateSchema.safeParse(artistData)

      if (!parsedData.success) {
        results.failed++
        const messages = parsedData.error.issues.map(e => e.message).join(', ')
        results.errors.push(`Row ${rowNumber}: ${messages}`)
        continue
      }

      await artistService.createArtist(parsedData.data as any)
      results.successful++
    } catch (error: any) {
      results.failed++
      results.errors.push(`Row ${rowNumber}: ${error.message}`)
    }
  }

  return successResponse(res, STATUS.OK, 'CSV Import completed', results)
}

export const getById = async (req: Request, res: Response) => {
  const artist = await artistService.getArtistById(req.params.id as string)
  if (!artist) {
    return errorResponse(res, STATUS.NOT_FOUND, 'Artist not found')
  }
  return successResponse(res, STATUS.OK, 'Artist retrieved successfully', artist)
}

export const create = async (req: Request, res: Response) => {
  const artist = await artistService.createArtist(req.body)
  return successResponse(res, STATUS.CREATED, 'Artist created successfully', artist)
}

export const update = async (req: Request, res: Response) => {
  const artist = await artistService.updateArtist(req.params.id as string, req.body)
  return successResponse(res, STATUS.OK, 'Artist updated successfully', artist)
}

export const remove = async (req: Request, res: Response) => {
  await artistService.deleteArtist(req.params.id as string)
  return successResponse(res, STATUS.OK, 'Artist deleted successfully')
}
