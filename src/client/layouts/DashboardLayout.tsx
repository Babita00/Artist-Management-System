import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { logoutAPI } from '../services/auth.api'
import { useAuthStore } from '../store'

const DashboardLayout = () => {
  const { user, clearTokens } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutAPI()
    } catch (e) {
      console.error('Logout failed on backend, clearing local auth state regardless')
    }
    clearTokens()
    navigate('/login')
  }

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col justify-between p-6">
        
        {/* Header */}
        <div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800">
              Artist System
            </h2>
            <p className="text-sm text-indigo-600 font-medium mt-1">
              {user?.role}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {user?.role === 'super_admin' && (
              <NavLink to="/dashboard/users" className={navLinkStyle}>
                Users
              </NavLink>
            )}

            {(user?.role === 'super_admin' ||
              user?.role === 'artist_manager') && (
              <>
                <NavLink to="/dashboard/artists" className={navLinkStyle}>
                  Artists
                </NavLink>

                <NavLink to="/dashboard/songs" className={navLinkStyle}>
                  Songs
                </NavLink>
              </>
            )}

            {user?.role === 'artist' && (
              <NavLink
                to={`/dashboard/artists/${user.id}/songs`}
                className={navLinkStyle}
              >
                My Songs
              </NavLink>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700">
            {user?.first_name} {user?.last_name}
          </p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[80vh]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout