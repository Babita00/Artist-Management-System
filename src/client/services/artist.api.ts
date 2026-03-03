import { request } from './_axios'
import { ENDPOINTS } from '../constants/url'
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
  return request({
    url: `${ENDPOINTS.ARTISTS}/export`,
    responseType: 'blob' as any,
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
