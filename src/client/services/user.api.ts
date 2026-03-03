import { request } from './_axios'
import { ENDPOINTS } from '../constants/url'
import { User } from '~/types'

export const getAllUsersAPI = (params?: { page?: number; limit?: number }) => {
  return request({
    url: ENDPOINTS.USERS,
    params,
  })
}

export const getUserByIdAPI = (id: string) => {
  return request<User>({
    url: `${ENDPOINTS.USERS}/${id}`,
  })
}

export const createUserAPI = (data: Partial<User>) => {
  return request<User>({
    url: ENDPOINTS.USERS,
    method: 'POST',
    data,
  })
}

export const updateUserAPI = (id: string, data: Partial<User>) => {
  return request<User>({
    url: `${ENDPOINTS.USERS}/${id}`,
    method: 'PATCH',
    data,
  })
}

export const deleteUserAPI = (id: string) => {
  return request({
    url: `${ENDPOINTS.USERS}/${id}`,
    method: 'DELETE',
  })
}
