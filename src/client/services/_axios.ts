import axios, { AxiosInstance } from 'axios'
import { useAuthStore } from '../store' 

export interface IRequestOptions {
  url: string
  params?: any
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: any
  headers?: any
  responseType?: any
}

const instance: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearTokens()
    }
    return Promise.reject(error)
  }
)

export const request = async <T = any>({
  url,
  params,
  method = 'GET',
  data,
  headers = {},
}: IRequestOptions): Promise<T> => {
  const response = await instance({
    url,
    params,
    method,
    data,
    headers: { ...headers },
  })
  
  // Unwrap the data object assuming standard successResponse `{ data: ..., message: ..., status: ... }` format
  return response.data.data ? response.data.data : response.data
}
