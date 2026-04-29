import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  PauseCircle,
  Stethoscope,
  XCircle,
} from 'lucide-react'
import { fetchDashboard } from '../../lib/endpoints'
import { LoadingScreen, EmptyState } from '../../components/Loading'
import { StatusBadge, UrgencyBadge } from '../../components/Badges'
import { formatDateShort, formatTimeRange, formatPrice } from '../../lib/format'
import { getErrorMessage } from '../../lib/api'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchDashboard()
      .then((d) => {
        if (active) setData(d)
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, 'No pudimos cargar el dashboard.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) return <LoadingScreen />
  if (!data) return null

  const stats = [
    {
      label: 'Pendientes',
      value: data.stats.pending_requests,
      icon: PauseCircle,
      tone: 'amber',
    },
    {
      label: 'Agendadas',
      value: data.stats.scheduled_requests,
      icon: Calendar,
      tone: 'brand',
    },
    {
      label: 'En atención',
      value: data.stats.in_attention_requests,
      icon: Stethoscope,
      tone: 'violet',
    },
    {
      label: 'Completadas',
      value: data.stats.completed_requests,
      icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      label: 'Canceladas',
      value: data.stats.canceled_requests,
      icon: XCircle,
      tone: 'slate',
    },
    {
      label: 'Total recibidas',
      value: data.stats.total_requests,
      icon: ClipboardList,
      tone: 'ink',
    },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <span className="text-[11px] uppercase tracking-[0.25em] text-brand-700 font-medium">
          Panel administrativo
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Resumen de actividad
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Vista general de las solicitudes recibidas y próximas atenciones.
        </p>
      </header>

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <KpiCard key={s.label} {...s} />
        ))}
      </section>

      {/* Próximas atenciones */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Próximas atenciones
            </h2>
            <p className="text-sm text-ink-muted">
              Solicitudes contactadas o agendadas con fecha desde hoy.
            </p>
          </div>
          <Link
            to="/admin/solicitudes?status=agendado"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.upcoming_appointments.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-8 w-8" />}
            title="Sin atenciones próximas"
            description="Cuando confirmes solicitudes con fecha futura, aparecerán aquí."
          />
        ) : (
          <RequestsTable rows={data.upcoming_appointments} showDate />
        )}
      </section>

      {/* Últimas recibidas */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Últimas solicitudes recibidas
            </h2>
            <p className="text-sm text-ink-muted">
              Las más recientes, en orden de llegada.
            </p>
          </div>
          <Link
            to="/admin/solicitudes"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.latest_requests.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-8 w-8" />}
            title="Aún no hay solicitudes"
            description="Cuando alguien complete el formulario público, aparecerá aquí."
          />
        ) : (
          <RequestsTable rows={data.latest_requests} showCreated />
        )}
      </section>
    </div>
  )
}

const TONES = {
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  brand: 'bg-brand-50 text-brand-800 ring-brand-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  ink: 'bg-ink/5 text-ink ring-slate-200',
}

function KpiCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-ink-faint">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${TONES[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold text-ink tabular-nums">
        {value}
      </div>
    </div>
  )
}

function RequestsTable({ rows, showDate, showCreated }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-canvas-subtle/50">
            <tr className="text-left">
              <Th>#</Th>
              <Th>Cliente / mascota</Th>
              <Th>Servicio</Th>
              <Th>{showDate ? 'Fecha' : 'Recibida'}</Th>
              <Th>Comuna</Th>
              <Th>Urgencia</Th>
              <Th>Estado</Th>
              <Th className="w-12"> </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-canvas-subtle/40">
                <Td className="font-mono text-xs text-ink-muted">
                  #{String(r.id).padStart(5, '0')}
                </Td>
                <Td>
                  <div className="font-medium text-ink">{r.client_name}</div>
                  <div className="text-xs text-ink-muted">{r.pet_name}</div>
                </Td>
                <Td className="text-ink-soft">{r.service_name}</Td>
                <Td className="text-ink-soft">
                  {showDate ? (
                    <>
                      {formatDateShort(r.preferred_date)}
                      <div className="text-xs text-ink-muted">
                        {formatTimeRange(r.preferred_time_start, r.preferred_time_end)}
                      </div>
                    </>
                  ) : (
                    formatDateShort(r.created_at)
                  )}
                </Td>
                <Td className="text-ink-soft">{r.commune_snapshot}</Td>
                <Td><UrgencyBadge urgency={r.urgency} /></Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td>
                  <Link
                    to={`/admin/solicitudes/${r.id}`}
                    className="text-brand-700 hover:text-brand-800"
                    aria-label="Ver detalle"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-faint ${className}`}>
      {children}
    </th>
  )
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>
}
