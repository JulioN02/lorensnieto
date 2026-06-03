import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { UserRole } from '../types'
import { api } from '../services/api'

interface NavItem {
  to: string
  label: string
  icon: string
  roles: string[]
}

const navigationItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.Admin, UserRole.Partner] },
  { to: '/properties', label: 'Propiedades', icon: '🏠', roles: [UserRole.Admin] },
  { to: '/services', label: 'Servicios', icon: '🔧', roles: [UserRole.Admin] },
  { to: '/inbox', label: 'Bandeja de Entrada', icon: '📬', roles: [UserRole.Admin] },
  { to: '/reservations', label: 'Reservas', icon: '📅', roles: [UserRole.Admin] },
  { to: '/reports', label: 'Reportes', icon: '📈', roles: [UserRole.Admin] },
  { to: '/partner', label: 'Socio Técnico', icon: '🤝', roles: [UserRole.Admin, UserRole.Partner] },
  { to: '/settings', label: 'Configuración', icon: '⚙️', roles: [UserRole.Admin] },
]

const roleLabels: Record<string, string> = {
  [UserRole.Admin]: 'Administradora',
  [UserRole.Partner]: 'Socio Técnico',
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [partnerAlertCount, setPartnerAlertCount] = useState(0)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await api.get('/admin/leads?status=nueva')
        if (data.success && data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount)
        }
      } catch {
        // Silently fail — badge is non-critical
      }

      // Fetch partner alert count
      try {
        const res = await api.get('/api/partner/summary')
        if (res.data.success && res.data.data?.activeAlerts !== undefined) {
          setPartnerAlertCount(res.data.data.activeAlerts)
        }
      } catch {
        // Silently fail for partner route
      }
    }
    fetchBadges()
    // Refresh every 30 seconds
    const interval = setInterval(fetchBadges, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredNavItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-primary transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-primary-700 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-bold text-white shadow-sm">
            LN
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-white">Lorens Nieto</h1>
            <p className="truncate text-xs text-primary-300">Panel Administrativo</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                      }`
                    }
                  >
                    <span className="text-lg" aria-hidden="true">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.to === '/inbox' && unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {item.to === '/partner' && partnerAlertCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {partnerAlertCount > 99 ? '99+' : partnerAlertCount}
                      </span>
                    )}
                  </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="shrink-0 border-t border-primary-700 p-4">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-primary-300">{user?.email}</p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {user ? roleLabels[user.role] : ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
