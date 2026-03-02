import {
  countSongs,
  findSongsPaginated,
  findSongById,
  createSongInDb,
  updateSongInDb,
  deleteSongInDb
} from '../repositories/song.repository'
import { Song } from '../../types'
import { paginate } from '../utils/pagination'

export const getAllSongs = async (page?: number, limit?: number, artistId?: string) => {
  return paginate(
    page,
    limit,
    async (limit, offset) => findSongsPaginated(limit, offset, artistId),
    async () => countSongs(artistId)
  )
}

export const getSongById = async (id: string) => {
  return findSongById(id)
}

export const createSong = async (songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
  return createSongInDb(songData)
}

export const updateSong = async (id: string, updateData: Partial<Song>) => {
  const existingSong = await findSongById(id)
  if (!existingSong) {
    throw new Error('Song not found')
  }
  return updateSongInDb(id, updateData)
}

export const deleteSong = async (id: string) => {
  const existingSong = await findSongById(id)
  if (!existingSong) {
    throw new Error('Song not found')
  }
  return deleteSongInDb(id)
}
