import clsx from 'clsx'
import { forwardRef } from 'react'

export const Field = forwardRef(function Field(
  { label, error, hint, required, className, children, ...rest },
  ref,
) {
  return (
    <label className={clsx('block', className)}>
      {label && (
        <span className={clsx('label', required && 'label-required')}>
          {label}
        </span>
      )}
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  )
})

export const Input = forwardRef(function Input(
  { error, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx('input', error && 'input-error', className)}
      {...rest}
    />
  )
})

export const Textarea = forwardRef(function Textarea(
  { error, className, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx('input resize-none', error && 'input-error', className)}
      {...rest}
    />
  )
})

export const Select = forwardRef(function Select(
  { error, className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={clsx('input pr-10 appearance-none bg-no-repeat bg-[right_0.75rem_center]', error && 'input-error', className)}
      style={{
        backgroundImage:
          'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%2394a3b8%27%3E%3Cpath fill-rule=%27evenodd%27 d=%27M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z%27 clip-rule=%27evenodd%27/%3E%3C/svg%3E")',
        backgroundSize: '1.25rem 1.25rem',
      }}
      {...rest}
    >
      {children}
    </select>
  )
})

export const Checkbox = forwardRef(function Checkbox(
  { label, error, className, ...rest },
  ref,
) {
  return (
    <label className={clsx('flex items-start gap-3 cursor-pointer', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
        {...rest}
      />
      <span className="text-sm text-ink-soft leading-snug">{label}</span>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
})
