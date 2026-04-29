import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

const navItems = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#zonas', label: 'Zonas' },
  { href: '#preguntas', label: 'Preguntas' },
  { href: '#contacto', label: 'Contacto' },
]

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-soft'
          : 'bg-transparent'
      )}
    >
      <div className="container-edge flex items-center justify-between py-4">
        <Link to="/" className="-m-1 p-1">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink-soft transition hover:text-brand-700 hover:bg-canvas-subtle"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <NavLink to="/admin/login" className="btn-ghost text-sm">
            Acceso veterinaria
          </NavLink>
          <Link to="/solicitar" className="btn-primary">
            Solicitar atención
          </Link>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden rounded-xl border border-slate-200 bg-white p-2 text-ink-soft"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer móvil */}
      {open && (
        <div className="lg:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-lg animate-fade-in">
          <div className="container-edge flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-ink-soft hover:bg-canvas-subtle"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-ink-soft hover:bg-canvas-subtle"
            >
              Acceso veterinaria
            </Link>
            <Link
              to="/solicitar"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 justify-center"
            >
              Solicitar atención
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
