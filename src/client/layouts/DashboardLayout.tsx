import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const breadcrumbLabel = (segment: string): string => {
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'Users',
    artists: 'Artists',
    songs: 'Songs',
  }

  return map[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

const getBreadcrumbSegments = (pathname: string): string[] => {
  return pathname
    .split('/')
    .filter(Boolean)
    .filter((seg) => {
      const isId = /^[0-9a-f-]{8,}$/i.test(seg)
      return !isId
    })
}

const DashboardLayout = () => {
  const location = useLocation()
  const segments = getBreadcrumbSegments(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center h-10 px-6 border-b border-border bg-background shrink-0">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {segments.map((seg, idx) => {
              const isLast = idx === segments.length - 1

              return (
                <span key={idx} className="flex items-center gap-1">
                  {idx > 0 && <span className=" text-gray-700">›</span>}
                  <span className={isLast ? 'text-foreground font-medium' : ''}>
                    {breadcrumbLabel(seg)}
                  </span>
                </span>
              )
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout