import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ClipboardList, Filter, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchAdminRequests } from '../../lib/endpoints'
import { LoadingScreen, EmptyState, Spinner } from '../../components/Loading'
import { StatusBadge, UrgencyBadge } from '../../components/Badges'
import { Field, Input, Select } from '../../components/FormControls'
import {
  formatDateShort,
  formatTimeRange,
  STATUS_LABELS,
} from '../../lib/format'
import { getErrorMessage } from '../../lib/api'

const ALL_STATUSES = Object.entries(STATUS_LABELS)

export default function AdminRequestsListPage() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const filters = useMemo(
    () => ({
      status: params.get('status') || '',
      date_from: params.get('date_from') || '',
      date_to: params.get('date_to') || '',
    }),
    [params]
  )

  const hasFilters =
    Boolean(filters.status) || Boolean(filters.date_from) || Boolean(filters.date_to)

  const load = async () => {
    setRefreshing(true)
    try {
      const apiParams = {}
      if (filters.status) apiParams.status = filters.status
      if (filters.date_from) apiParams.date_from = filters.date_from
      if (filters.date_to) apiParams.date_to = filters.date_to
      const data = await fetchAdminRequests(apiParams)
      setRows(data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos cargar las solicitudes.'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.date_from, filters.date_to])

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const clearFilters = () => setParams({}, { replace: true })

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-brand-700 font-medium">
            Solicitudes
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Gestión de solicitudes
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Filtra por estado o rango de fechas. Haz clic en una fila para ver el detalle.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={refreshing}
          className="btn-secondary text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </header>

      {/* Filtros */}
      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
          <Filter className="h-4 w-4 text-ink-muted" />
          Filtros
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" /> Limpiar
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Estado">
            <Select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              {ALL_STATUSES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Desde (fecha preferida)">
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => updateFilter('date_from', e.target.value)}
            />
          </Field>
          <Field label="Hasta (fecha preferida)">
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => updateFilter('date_to', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Tabla */}
      {loading ? (
        <LoadingScreen />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title={hasFilters ? 'Sin resultados' : 'Aún no hay solicitudes'}
          description={
            hasFilters
              ? 'Ajusta los filtros para ver más resultados.'
              : 'Cuando alguien complete el formulario público, aparecerá aquí.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle/50">
                <tr className="text-left">
                  <Th>#</Th>
                  <Th>Cliente / mascota</Th>
                  <Th>Servicio</Th>
                  <Th>Fecha preferida</Th>
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
                      <div className="text-xs text-ink-muted">
                        {r.pet_name} · {r.client_phone}
                      </div>
                    </Td>
                    <Td className="text-ink-soft">{r.service_name}</Td>
                    <Td className="text-ink-soft">
                      {formatDateShort(r.preferred_date)}
                      <div className="text-xs text-ink-muted">
                        {formatTimeRange(r.preferred_time_start, r.preferred_time_end)}
                      </div>
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
      )}
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
