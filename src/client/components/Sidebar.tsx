import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Users, Music2, Mic2, Menu, X, LogOut, Music } from 'lucide-react'
import { useAuthStore } from '../store'
import { logoutAPI } from '../services/auth.api'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, clearTokens } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutAPI()
    } catch {
      // clear locally regardless
    }
    clearTokens()
    navigate('/login')
  }

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { to: '/dashboard/users', label: 'Users', icon: <Users className="size-4 shrink-0" /> },
          { to: '/dashboard/artists', label: 'Artists', icon: <Mic2 className="size-4 shrink-0" /> },
        ]
      case 'artist_manager':
        return [
          { to: '/dashboard/artists', label: 'Artists', icon: <Mic2 className="size-4 shrink-0" /> },
          { to: '/dashboard/songs', label: 'Songs', icon: <Music2 className="size-4 shrink-0" /> },
        ]
      case 'artist':
        return [
          {
            to: `/dashboard/artists/${user.id}/songs`,
            label: 'My Songs',
            icon: <Music2 className="size-4 shrink-0" />,
          },
        ]
      default:
        return []
    }
  }

  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
              <Music className="size-4" />
            </div>
            <span className="font-bold text-sm text-sidebar-foreground tracking-tight">
              ArtistHub
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground mx-auto">
            <Music className="size-4" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1 transition-colors',
            collapsed && 'mx-auto mt-0'
          )}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu className="size-4" /> : <X className="size-4" />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {getNavItems().map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-sidebar-border px-2 py-3 space-y-2">
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md',
            collapsed && 'justify-center'
          )}
        >
          {/* Avatar */}
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {initials || '?'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-foreground leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-muted-foreground capitalize leading-tight">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
