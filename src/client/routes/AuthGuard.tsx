import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store'

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.accessToken)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export const PublicRoute = () => {
  const token = useAuthStore((state) => state.accessToken)
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
