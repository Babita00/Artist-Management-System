import {
  countAllArtists,
  findArtistsPaginated,
  findArtistById,
  createArtistInDb,
  updateArtistInDb,
  deleteArtistInDb
} from '../repositories/artist.repository'
import { Artist } from '../../types'
import { paginate } from '../utils/pagination'

export const getAllArtists = async (page?: number, limit?: number) => {
  return paginate(
    page,
    limit,
    async (limit, offset) => findArtistsPaginated(limit, offset),
    async () => countAllArtists()
  )
}

export const getArtistById = async (id: string) => {
  return findArtistById(id)
}

export const createArtist = async (artistData: Omit<Artist, 'id' | 'created_at' | 'updated_at'>) => {
  return createArtistInDb(artistData)
}

export const updateArtist = async (id: string, updateData: Partial<Artist>) => {
  const existingArtist = await findArtistById(id)
  if (!existingArtist) {
    throw new Error('Artist not found')
  }
  return updateArtistInDb(id, updateData)
}

export const deleteArtist = async (id: string) => {
  const existingArtist = await findArtistById(id)
  if (!existingArtist) {
    throw new Error('Artist not found')
  }
  return deleteArtistInDb(id)
}
