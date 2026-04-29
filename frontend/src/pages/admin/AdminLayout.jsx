import { useState } from 'react'
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Stethoscope,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../lib/auth'
import { LoadingScreen } from '../../components/Loading'
import Logo from '../../components/Logo'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { to: '/admin/servicios', label: 'Servicios', icon: Stethoscope },
  { to: '/admin/zonas', label: 'Zonas de atención', icon: MapPin },
]

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }
  return children
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white lg:hidden animate-fade-in">
            <SidebarContent
              user={user}
              onLogout={handleLogout}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Header — mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link to="/admin">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="rounded-xl border border-slate-200 p-2 text-ink-soft"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <main className="lg:pl-64">
        <div className="px-5 py-8 sm:px-8 lg:px-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function SidebarContent({ user, onLogout, onNavigate }) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <Link to="/admin" onClick={onNavigate}>
          <Logo />
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Cerrar menú"
            className="rounded-xl p-2 text-ink-muted hover:bg-canvas-subtle"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-ink-soft hover:bg-canvas-subtle hover:text-ink'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-canvas-subtle px-3 py-3">
          <div className="text-xs uppercase tracking-wider text-ink-faint">Sesión</div>
          <div className="mt-1 truncate text-sm font-medium text-ink">{user?.full_name}</div>
          <div className="truncate text-xs text-ink-muted">{user?.email}</div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:bg-canvas hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}
