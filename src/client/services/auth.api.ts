import { request } from './_axios'
import { ENDPOINTS } from '../constants/constants'

export const loginAPI = (data: any) => {
  return request({
    url: ENDPOINTS.AUTH.LOGIN,
    method: 'POST',
    data,
  })
}

export const registerAPI = (data: any) => {
  return request({
    url: ENDPOINTS.AUTH.REGISTER,
    method: 'POST',
    data,
  })
}

export const logoutAPI = () => {
  return request({
    url: ENDPOINTS.AUTH.LOGOUT,
    method: 'POST',
  })
}
