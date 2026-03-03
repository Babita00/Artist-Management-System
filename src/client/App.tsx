import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './layouts/DashboardLayout'
import UsersPage from './pages/UsersPage'
import ArtistsPage from './pages/ArtistsPage'
import SongsPage from './pages/SongsPage'
import AllSongsPage from './pages/AllSongsPage'
import { ProtectedRoute, PublicRoute } from './routes/AuthGuard'
import { useAuthStore } from './store'
import { Toaster } from 'sonner'
import './App.css'

function App() {
  const user = useAuthStore((state) => state.user)

  const getDashboardIndex = () => {
    if (user?.role === 'super_admin') return '/dashboard/users'
    if (user?.role === 'artist_manager') return '/dashboard/artists'
    if (user?.role === 'artist') return `/dashboard/songs`
    return '/dashboard/artists'  
  }

  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to={getDashboardIndex()} replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="artists" element={<ArtistsPage />} />
            <Route path="songs" element={<AllSongsPage />} />
            <Route path="artists/:artistId/songs" element={<SongsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
