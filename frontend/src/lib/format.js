// ---------- Precio ----------
export function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return 'A confirmar'
  }
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return 'A confirmar'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPriceFrom(value) {
  if (value === null || value === undefined || value === '') {
    return 'Valor a confirmar'
  }
  return `Desde ${formatPrice(value)}`
}

// ---------- Fechas ----------
export function formatDate(iso) {
  if (!iso) return ''
  // iso puede ser "YYYY-MM-DD" o ISO completo
  const d = iso.length === 10 ? new Date(iso + 'T12:00:00') : new Date(iso)
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(iso) {
  if (!iso) return ''
  const d = iso.length === 10 ? new Date(iso + 'T12:00:00') : new Date(iso)
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.slice(0, 5) // "HH:MM:SS" -> "HH:MM"
}

export function formatTimeRange(start, end) {
  if (!start && !end) return 'Sin preferencia'
  if (start && end) return `${formatTime(start)} – ${formatTime(end)}`
  if (start) return `Desde ${formatTime(start)}`
  return `Hasta ${formatTime(end)}`
}

// ---------- Estados ----------
export const STATUS_LABELS = {
  pendiente: 'Pendiente',
  contactado: 'Contactado',
  agendado: 'Agendado',
  en_atencion: 'En atención',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export const STATUS_STYLES = {
  pendiente: 'bg-amber-100 text-amber-800',
  contactado: 'bg-blue-100 text-blue-800',
  agendado: 'bg-brand-100 text-brand-800',
  en_atencion: 'bg-violet-100 text-violet-800',
  completado: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-slate-200 text-slate-700',
}

export const URGENCY_LABELS = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
}

export const URGENCY_STYLES = {
  baja: 'bg-slate-100 text-slate-700',
  media: 'bg-amber-100 text-amber-800',
  alta: 'bg-rose-100 text-rose-800',
}

export const PET_TYPE_LABELS = {
  perro: 'Perro',
  gato: 'Gato',
  otro: 'Otro',
}

export const PET_SEX_LABELS = {
  macho: 'Macho',
  hembra: 'Hembra',
  desconocido: 'No especificado',
}

export const SERVICE_CATEGORY_LABELS = {
  consulta: 'Consulta',
  preventivo: 'Preventivo',
  procedimiento_simple: 'Procedimiento simple',
  asesoria: 'Asesoría',
  otro: 'Otro',
}
