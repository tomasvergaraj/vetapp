import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../lib/auth'
import { Field, Input } from '../../components/FormControls'
import { Spinner } from '../../components/Loading'
import { getErrorMessage } from '../../lib/api'
import Logo from '../../components/Logo'

export default function AdminLoginPage() {
  const { user, login, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (authLoading) return null
  if (user) {
    const target = location.state?.from || '/admin'
    return <Navigate to={target} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success('Bienvenida')
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Credenciales inválidas.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* fondo decorativo */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-canvas to-canvas" />
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-brand-200/30 blur-3xl" />
      </div>

      <div className="container-edge flex min-h-screen flex-col">
        <div className="py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center pb-16">
          <div className="w-full max-w-md">
            <div className="flex justify-center">
              <Logo />
            </div>

            <div className="mt-10 rounded-3xl bg-white p-8 ring-1 ring-slate-100 shadow-card">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-brand-700 font-medium">
                  Panel privado
                </span>
                <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
                  Iniciar sesión
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Acceso solo para la veterinaria.
                </p>
              </div>

              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <Field label="Correo electrónico" required>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="admin@veterinaria.local"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Field>

                <Field label="Contraseña" required>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center"
                >
                  {submitting ? (
                    <>
                      <Spinner className="h-4 w-4" /> Ingresando…
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-ink-faint">
              Las credenciales por defecto se definen al sembrar la base de datos.
              <br />
              Recuerda cambiarlas en producción.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
