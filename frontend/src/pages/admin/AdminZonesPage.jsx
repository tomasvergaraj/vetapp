import { useEffect, useState } from 'react'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createAdminZone,
  deleteAdminZone,
  fetchAdminZones,
  updateAdminZone,
} from '../../lib/endpoints'
import { LoadingScreen, EmptyState, Spinner } from '../../components/Loading'
import { Field, Input, Textarea, Checkbox } from '../../components/FormControls'
import Modal from '../../components/Modal'
import { formatPrice } from '../../lib/format'
import { getErrorMessage } from '../../lib/api'

const EMPTY_FORM = {
  name: '',
  travel_surcharge: '',
  notes: '',
  is_active: true,
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await fetchAdminZones()
      setZones(data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos cargar las zonas.'))
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
  const openEdit = (z) => {
    setForm({
      name: z.name,
      travel_surcharge:
        z.travel_surcharge !== null && z.travel_surcharge !== undefined
          ? String(z.travel_surcharge)
          : '',
      notes: z.notes || '',
      is_active: z.is_active,
    })
    setEditing(z)
  }
  const close = () => setEditing(null)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        travel_surcharge:
          form.travel_surcharge === '' ? null : Number(form.travel_surcharge),
        notes: form.notes.trim() || null,
        is_active: form.is_active,
      }
      if (editing && editing.id) {
        await updateAdminZone(editing.id, payload)
        toast.success('Zona actualizada.')
      } else {
        await createAdminZone(payload)
        toast.success('Zona creada.')
      }
      close()
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos guardar la zona.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (z) => {
    const confirmed = window.confirm(
      `¿Eliminar la zona "${z.name}"?\n\nEl historial de solicitudes ya recibidas se conserva (la comuna se guarda como texto en cada solicitud).`
    )
    if (!confirmed) return
    try {
      await deleteAdminZone(z.id)
      toast.success('Zona eliminada.')
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos eliminar la zona.'))
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-brand-700 font-medium">
            Cobertura
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Zonas de atención
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Comunas en las que ofreces atención y su recargo opcional por traslado.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary text-sm">
          <Plus className="h-4 w-4" />
          Nueva zona
        </button>
      </header>

      {zones.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" />}
          title="Aún no hay zonas configuradas"
          description="Agrega las comunas en las que atiendes para que aparezcan en el formulario."
          action={
            <button onClick={openNew} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Nueva zona
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle/50">
                <tr className="text-left">
                  <Th>Comuna</Th>
                  <Th>Recargo traslado</Th>
                  <Th>Notas</Th>
                  <Th>Estado</Th>
                  <Th className="w-32 text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((z) => (
                  <tr key={z.id} className="hover:bg-canvas-subtle/40">
                    <Td className="font-medium text-ink">{z.name}</Td>
                    <Td className="text-ink-soft tabular-nums">
                      {z.travel_surcharge !== null && z.travel_surcharge !== undefined
                        ? formatPrice(z.travel_surcharge)
                        : 'Sin recargo'}
                    </Td>
                    <Td className="text-ink-muted">
                      {z.notes ? (
                        <span className="line-clamp-2">{z.notes}</span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td>
                      {z.is_active ? (
                        <span className="badge bg-emerald-100 text-emerald-800">Activa</span>
                      ) : (
                        <span className="badge bg-slate-200 text-slate-700">Inactiva</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(z)}
                          className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas-subtle hover:text-ink"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(z)}
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
        title={editing && editing.id ? 'Editar zona' : 'Nueva zona'}
        footer={
          <>
            <button type="button" onClick={close} className="btn-ghost text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              form="zone-form"
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? <Spinner className="h-4 w-4" /> : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="zone-form" onSubmit={save} className="space-y-4">
          <Field label="Comuna" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Viña del Mar"
            />
          </Field>
          <Field
            label="Recargo por traslado (CLP)"
            hint="Vacío o 0 = sin recargo."
          >
            <Input
              type="number"
              min="0"
              step="500"
              value={form.travel_surcharge}
              onChange={(e) => setForm({ ...form, travel_surcharge: e.target.value })}
            />
          </Field>
          <Field label="Notas internas">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Comentarios sobre tiempos de viaje, sectores, etc."
            />
          </Field>
          <Checkbox
            label="Activa (se muestra en el formulario público)"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
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
