import { request } from './_axios'
import { ENDPOINTS } from '../constants/url'
import { Song } from '~/types'

export const getAllSongsAPI = (params?: {
  page?: number
  limit?: number
  artist_id?: string
}) => {
  return request({
    url: ENDPOINTS.SONGS,
    params,
  })
}

export const getSongByIdAPI = (id: string) => {
  return request<Song>({
    url: `${ENDPOINTS.SONGS}/${id}`,
  })
}

export const createSongAPI = (data: Partial<Song>) => {
  return request<Song>({
    url: ENDPOINTS.SONGS,
    method: 'POST',
    data,
  })
}

export const updateSongAPI = (id: string, data: Partial<Song>) => {
  return request<Song>({
    url: `${ENDPOINTS.SONGS}/${id}`,
    method: 'PATCH',
    data,
  })
}

export const deleteSongAPI = (id: string) => {
  return request({
    url: `${ENDPOINTS.SONGS}/${id}`,
    method: 'DELETE',
  })
}
