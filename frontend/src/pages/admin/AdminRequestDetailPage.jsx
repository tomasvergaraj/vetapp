import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Hash,
  Mail,
  MapPin,
  MessageCircle,
  PawPrint,
  Phone,
  Save,
  Stethoscope,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchAdminRequestDetail,
  updateRequestFields,
  updateRequestStatus,
} from '../../lib/endpoints'
import { LoadingScreen, Spinner } from '../../components/Loading'
import { StatusBadge, UrgencyBadge } from '../../components/Badges'
import { Field, Input, Select, Textarea } from '../../components/FormControls'
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatTimeRange,
  PET_SEX_LABELS,
  PET_TYPE_LABELS,
  STATUS_LABELS,
} from '../../lib/format'
import { getErrorMessage } from '../../lib/api'

// Espejo del backend: qué transiciones se permiten desde cada estado.
const ALLOWED_TRANSITIONS = {
  pendiente: ['contactado', 'agendado', 'cancelado'],
  contactado: ['agendado', 'cancelado', 'pendiente'],
  agendado: ['en_atencion', 'contactado', 'cancelado'],
  en_atencion: ['completado', 'cancelado'],
  completado: [],
  cancelado: [],
}

export default function AdminRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  // Form de edición
  const [finalPrice, setFinalPrice] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [savingFields, setSavingFields] = useState(false)

  // Cambio de estado
  const [targetStatus, setTargetStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  const load = async () => {
    try {
      const data = await fetchAdminRequestDetail(id)
      setRequest(data)
      setFinalPrice(data.final_price ?? '')
      setInternalNotes(data.internal_notes ?? '')
      setTargetStatus('')
      setStatusNote('')
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos cargar la solicitud.'))
      navigate('/admin/solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <LoadingScreen />
  if (!request) return null

  const allowed = ALLOWED_TRANSITIONS[request.status] || []
  const isTerminal = allowed.length === 0

  const handleSaveFields = async (e) => {
    e.preventDefault()
    setSavingFields(true)
    try {
      const fields = {}
      // Solo enviamos los que cambiaron respecto a lo cargado
      if (finalPrice === '' && request.final_price !== null) {
        fields.final_price = null
      } else if (finalPrice !== '' && Number(finalPrice) !== Number(request.final_price)) {
        fields.final_price = Number(finalPrice)
      }
      const trimmedNotes = internalNotes.trim()
      const currentNotes = request.internal_notes ?? ''
      if (trimmedNotes !== currentNotes) {
        fields.internal_notes = trimmedNotes || null
      }

      if (Object.keys(fields).length === 0) {
        toast('No hay cambios que guardar.', { icon: 'ℹ️' })
        return
      }

      const updated = await updateRequestFields(request.id, fields)
      setRequest(updated)
      toast.success('Cambios guardados.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos guardar los cambios.'))
    } finally {
      setSavingFields(false)
    }
  }

  const handleChangeStatus = async (e) => {
    e.preventDefault()
    if (!targetStatus) return
    setSavingStatus(true)
    try {
      const updated = await updateRequestStatus(
        request.id,
        targetStatus,
        statusNote || null
      )
      setRequest(updated)
      setTargetStatus('')
      setStatusNote('')
      toast.success(`Estado actualizado a ${STATUS_LABELS[targetStatus]}.`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos cambiar el estado.'))
    } finally {
      setSavingStatus(false)
    }
  }

  const phoneE164 = (request.client.phone || '').replace(/[^\d+]/g, '')
  const whatsappLink = phoneE164
    ? `https://wa.me/${phoneE164.replace(/^\+/, '')}`
    : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/admin/solicitudes"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-ink-muted">
                #{String(request.id).padStart(5, '0')}
              </span>
              <StatusBadge status={request.status} />
              <UrgencyBadge urgency={request.urgency} />
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
              {request.service.name}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Recibida el {formatDateTime(request.created_at)}
            </p>
          </div>
          {whatsappLink && request.accepts_whatsapp && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <MessageCircle className="h-4 w-4" />
              Abrir WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ====== Columna principal ====== */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cliente */}
          <Card title="Dueño" icon={User}>
            <DataGrid>
              <Datum label="Nombre" value={request.client.full_name} />
              <Datum
                label="Teléfono"
                value={
                  <a
                    href={`tel:${phoneE164}`}
                    className="text-brand-700 hover:text-brand-800"
                  >
                    {request.client.phone}
                  </a>
                }
                icon={Phone}
              />
              <Datum
                label="Correo"
                value={
                  <a
                    href={`mailto:${request.client.email}`}
                    className="text-brand-700 hover:text-brand-800 break-all"
                  >
                    {request.client.email}
                  </a>
                }
                icon={Mail}
              />
              <Datum
                label="Comuna"
                value={request.commune_snapshot}
                icon={MapPin}
              />
              <Datum
                label="Dirección"
                value={request.client.address}
                full
              />
              {request.client.location_reference && (
                <Datum
                  label="Referencia"
                  value={request.client.location_reference}
                  full
                />
              )}
            </DataGrid>
          </Card>

          {/* Mascota */}
          <Card title="Mascota" icon={PawPrint}>
            <DataGrid>
              <Datum label="Nombre" value={request.pet.name} />
              <Datum label="Tipo" value={PET_TYPE_LABELS[request.pet.pet_type]} />
              <Datum label="Raza" value={request.pet.breed || '—'} />
              <Datum label="Sexo" value={PET_SEX_LABELS[request.pet.sex]} />
              <Datum
                label="Edad"
                value={
                  request.pet.approximate_age_years
                    ? `${request.pet.approximate_age_years} años`
                    : '—'
                }
              />
              <Datum
                label="Peso"
                value={
                  request.pet.approximate_weight_kg
                    ? `${request.pet.approximate_weight_kg} kg`
                    : '—'
                }
              />
              {request.pet.notes && (
                <Datum label="Observaciones" value={request.pet.notes} full />
              )}
            </DataGrid>
          </Card>

          {/* Detalle de la solicitud */}
          <Card title="Detalle de la atención" icon={Stethoscope}>
            <DataGrid>
              <Datum label="Servicio" value={request.service.name} full />
              <Datum
                label="Fecha preferida"
                value={formatDate(request.preferred_date)}
                icon={Calendar}
              />
              <Datum
                label="Horario"
                value={formatTimeRange(
                  request.preferred_time_start,
                  request.preferred_time_end
                )}
                icon={Clock}
              />
              <Datum
                label="WhatsApp"
                value={request.accepts_whatsapp ? 'Aceptado' : 'No autorizado'}
              />
              {request.description && (
                <Datum label="Descripción" value={request.description} full />
              )}
            </DataGrid>
          </Card>

          {/* Edición de campos del admin */}
          <Card title="Información de gestión" icon={Hash}>
            <form onSubmit={handleSaveFields} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Precio final (CLP)"
                  hint={
                    request.final_price !== null
                      ? `Actual: ${formatPrice(request.final_price)}`
                      : 'Aún no definido'
                  }
                >
                  <Input
                    type="number"
                    min="0"
                    step="500"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    placeholder="Ej: 25000"
                  />
                </Field>
              </div>
              <Field
                label="Notas internas"
                hint="No visibles para el cliente."
              >
                <Textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Recordatorios, observaciones, etc."
                />
              </Field>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingFields}
                  className="btn-primary text-sm"
                >
                  {savingFields ? (
                    <>
                      <Spinner className="h-4 w-4" /> Guardando…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* ====== Columna lateral ====== */}
        <div className="space-y-6">
          {/* Cambio de estado */}
          <Card title="Cambiar estado">
            {isTerminal ? (
              <p className="text-sm text-ink-muted">
                Esta solicitud está en un estado terminal y no puede modificarse.
              </p>
            ) : (
              <form onSubmit={handleChangeStatus} className="space-y-4">
                <div>
                  <span className="label">Estado actual</span>
                  <div className="mt-1.5">
                    <StatusBadge status={request.status} />
                  </div>
                </div>
                <Field label="Nuevo estado" required>
                  <Select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar…</option>
                    {allowed.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Nota del cambio"
                  hint="Opcional. Se guarda en el historial."
                >
                  <Textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Ej: confirmado por WhatsApp"
                  />
                </Field>
                <button
                  type="submit"
                  disabled={!targetStatus || savingStatus}
                  className="btn-primary w-full justify-center text-sm"
                >
                  {savingStatus ? (
                    <>
                      <Spinner className="h-4 w-4" /> Actualizando…
                    </>
                  ) : (
                    'Actualizar estado'
                  )}
                </button>
              </form>
            )}
          </Card>

          {/* Historial */}
          <Card title="Historial">
            {request.status_history.length === 0 ? (
              <p className="text-sm text-ink-muted">Sin cambios registrados.</p>
            ) : (
              <ol className="space-y-4">
                {request.status_history.map((h) => (
                  <li key={h.id} className="relative pl-6">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100"
                    />
                    <div className="text-sm font-medium text-ink">
                      {h.from_status ? (
                        <>
                          {STATUS_LABELS[h.from_status]} →{' '}
                          {STATUS_LABELS[h.to_status]}
                        </>
                      ) : (
                        <>Solicitud creada</>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">
                      {formatDateTime(h.created_at)}
                    </div>
                    {h.note && (
                      <p className="mt-1.5 rounded-lg bg-canvas-subtle px-3 py-2 text-xs text-ink-soft">
                        {h.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// ---------- Subcomponentes ----------

function Card({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft">
      <header className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        {Icon && <Icon className="h-4 w-4 text-brand-700" />}
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

function DataGrid({ children }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
}

function Datum({ label, value, icon: Icon, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="mt-1 flex items-start gap-1.5 text-sm text-ink">
        {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 flex-none text-ink-muted" />}
        <span className="break-words">{value}</span>
      </dd>
    </div>
  )
}
