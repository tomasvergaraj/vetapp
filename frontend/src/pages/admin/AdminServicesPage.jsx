import { useEffect, useState } from 'react'
import { Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createAdminService,
  deleteAdminService,
  fetchAdminServices,
  updateAdminService,
} from '../../lib/endpoints'
import { LoadingScreen, EmptyState, Spinner } from '../../components/Loading'
import { Field, Input, Select, Textarea, Checkbox } from '../../components/FormControls'
import Modal from '../../components/Modal'
import {
  formatPrice,
  SERVICE_CATEGORY_LABELS,
} from '../../lib/format'
import { getErrorMessage } from '../../lib/api'

const EMPTY_FORM = {
  name: '',
  description: '',
  base_price: '',
  estimated_duration_minutes: '',
  category: 'otro',
  is_active: true,
}

const CATEGORIES = Object.entries(SERVICE_CATEGORY_LABELS)

export default function AdminServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = cerrado, {} = nuevo, {id, ...} = editando
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await fetchAdminServices()
      setServices(data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos cargar los servicios.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditing({})
  }

  const openEdit = (svc) => {
    setForm({
      name: svc.name,
      description: svc.description || '',
      base_price: svc.base_price !== null && svc.base_price !== undefined ? String(svc.base_price) : '',
      estimated_duration_minutes:
        svc.estimated_duration_minutes !== null && svc.estimated_duration_minutes !== undefined
          ? String(svc.estimated_duration_minutes)
          : '',
      category: svc.category,
      is_active: svc.is_active,
    })
    setEditing(svc)
  }

  const close = () => {
    setEditing(null)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        base_price: form.base_price === '' ? null : Number(form.base_price),
        estimated_duration_minutes:
          form.estimated_duration_minutes === '' ? null : Number(form.estimated_duration_minutes),
        category: form.category,
        is_active: form.is_active,
      }

      if (editing && editing.id) {
        await updateAdminService(editing.id, payload)
        toast.success('Servicio actualizado.')
      } else {
        await createAdminService(payload)
        toast.success('Servicio creado.')
      }
      close()
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos guardar el servicio.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (svc) => {
    const confirmed = window.confirm(
      `¿Eliminar el servicio "${svc.name}"?\n\nSi tiene solicitudes asociadas se desactivará en lugar de eliminarse para preservar el historial.`
    )
    if (!confirmed) return
    try {
      await deleteAdminService(svc.id)
      toast.success('Servicio eliminado.')
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos eliminar el servicio.'))
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-brand-700 font-medium">
            Catálogo
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Servicios
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Define los servicios disponibles, su precio referencial y duración estimada.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary text-sm">
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </button>
      </header>

      {services.length === 0 ? (
        <EmptyState
          icon={<Stethoscope className="h-8 w-8" />}
          title="Aún no hay servicios"
          description="Crea el primer servicio para comenzar a recibir solicitudes."
          action={
            <button onClick={openNew} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Nuevo servicio
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle/50">
                <tr className="text-left">
                  <Th>Servicio</Th>
                  <Th>Categoría</Th>
                  <Th>Precio base</Th>
                  <Th>Duración</Th>
                  <Th>Estado</Th>
                  <Th className="w-32 text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-canvas-subtle/40">
                    <Td>
                      <div className="font-medium text-ink">{s.name}</div>
                      {s.description && (
                        <div className="text-xs text-ink-muted line-clamp-2">{s.description}</div>
                      )}
                    </Td>
                    <Td className="text-ink-soft">
                      {SERVICE_CATEGORY_LABELS[s.category] || s.category}
                    </Td>
                    <Td className="text-ink-soft tabular-nums">
                      {formatPrice(s.base_price)}
                    </Td>
                    <Td className="text-ink-soft">
                      {s.estimated_duration_minutes ? `${s.estimated_duration_minutes} min` : '—'}
                    </Td>
                    <Td>
                      {s.is_active ? (
                        <span className="badge bg-emerald-100 text-emerald-800">Activo</span>
                      ) : (
                        <span className="badge bg-slate-200 text-slate-700">Inactivo</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas-subtle hover:text-ink"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={close}
        title={editing && editing.id ? 'Editar servicio' : 'Nuevo servicio'}
        footer={
          <>
            <button type="button" onClick={close} className="btn-ghost text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              form="service-form"
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? <Spinner className="h-4 w-4" /> : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={save} className="space-y-4">
          <Field label="Nombre" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Consulta veterinaria a domicilio"
            />
          </Field>
          <Field label="Descripción">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Breve descripción que verá el cliente."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Precio base (CLP)"
              hint="Vacío = 'a confirmar'."
            >
              <Input
                type="number"
                min="0"
                step="500"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              />
            </Field>
            <Field label="Duración estimada (min)">
              <Input
                type="number"
                min="5"
                max="600"
                value={form.estimated_duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, estimated_duration_minutes: e.target.value })
                }
              />
            </Field>
            <Field label="Categoría">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Visibilidad">
              <Checkbox
                label="Activo (se muestra en el sitio público)"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            </Field>
          </div>
        </form>
      </Modal>
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
