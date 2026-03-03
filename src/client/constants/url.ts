export const API_BASE_URL = '/api/v1'

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  USERS: `${API_BASE_URL}/users`,
  ARTISTS: `${API_BASE_URL}/artists`,
  SONGS: `${API_BASE_URL}/songs`,
}
