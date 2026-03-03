import { request } from './_axios'
import { ENDPOINTS } from '../constants/constants'
import { Artist } from '~/types'

export const getAllArtistsAPI = (params?: { page?: number; limit?: number }) => {
  return request({
    url: ENDPOINTS.ARTISTS,
    params,
  })
}

export const getArtistByIdAPI = (id: string) => {
  return request<Artist>({
    url: `${ENDPOINTS.ARTISTS}/${id}`,
  })
}

export const createArtistAPI = (data: Partial<Artist>) => {
  return request<Artist>({
    url: ENDPOINTS.ARTISTS,
    method: 'POST',
    data,
  })
}

export const updateArtistAPI = (id: string, data: Partial<Artist>) => {
  return request<Artist>({
    url: `${ENDPOINTS.ARTISTS}/${id}`,
    method: 'PUT',
    data,
  })
}

export const deleteArtistAPI = (id: string) => {
  return request({
    url: `${ENDPOINTS.ARTISTS}/${id}`,
    method: 'DELETE',
  })
}

export const exportArtistsAPI = () => {
  // We use standard fetch/axios here, but since it's a blob/csv, we might need a custom config
  // For basic download, sometimes standard request works if we specify responseType: 'blob'
  return request({
    url: `${ENDPOINTS.ARTISTS}/export`,
    responseType: 'blob' as any, // bypassing the standard strict type to allow blob
  })
}

export const importArtistsAPI = (formData: FormData) => {
  return request({
    url: `${ENDPOINTS.ARTISTS}/import`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
