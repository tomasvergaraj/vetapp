import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, MessageCircle, ArrowLeft, Clock } from 'lucide-react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function RequestConfirmationPage() {
  const [params] = useSearchParams()
  const id = params.get('id')

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-32 pb-24">
        <div className="container-edge max-w-2xl">
          <div className="rounded-3xl bg-white p-10 ring-1 ring-slate-100 shadow-card text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
              <CheckCircle2 className="h-8 w-8 text-brand-700" />
            </div>

            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Solicitud recibida
            </h1>
            <p className="mt-4 text-pretty text-ink-muted leading-relaxed">
              La veterinaria revisará tu solicitud y se contactará contigo para
              confirmar disponibilidad, horario y valor final del servicio.
            </p>

            {id && (
              <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-canvas-subtle px-4 py-2 text-sm text-ink-soft">
                Número de solicitud:
                <span className="font-mono font-semibold text-ink">#{id.padStart(5, '0')}</span>
              </div>
            )}

            <div className="mt-10 grid gap-3 sm:grid-cols-2 text-left">
              <InfoCard
                icon={Clock}
                title="Tiempo de respuesta"
                text="Normalmente respondemos en menos de 24 horas hábiles."
              />
              <InfoCard
                icon={MessageCircle}
                title="Contacto directo"
                text="Si lo autorizaste, recibirás un mensaje por WhatsApp."
              />
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/" className="btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
              <Link to="/solicitar" className="btn-ghost text-sm">
                Crear otra solicitud
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-canvas/60 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        <Icon className="h-4 w-4 text-brand-700" />
        {title}
      </div>
      <p className="mt-1.5 text-sm text-ink-muted">{text}</p>
    </div>
  )
}
