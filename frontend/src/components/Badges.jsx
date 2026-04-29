import clsx from 'clsx'
import {
  STATUS_LABELS,
  STATUS_STYLES,
  URGENCY_LABELS,
  URGENCY_STYLES,
} from '../lib/format'

export function StatusBadge({ status }) {
  return (
    <span className={clsx('badge', STATUS_STYLES[status] || 'bg-slate-100 text-slate-700')}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function UrgencyBadge({ urgency }) {
  return (
    <span className={clsx('badge', URGENCY_STYLES[urgency] || 'bg-slate-100 text-slate-700')}>
      {URGENCY_LABELS[urgency] || urgency}
    </span>
  )
}
