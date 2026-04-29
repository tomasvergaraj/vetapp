export default function Logo({ className = '', light = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${light ? 'bg-white/15' : 'bg-brand-700'}`}>
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="white" aria-hidden="true">
          <circle cx="11" cy="11" r="2.4" />
          <circle cx="21" cy="11" r="2.4" />
          <circle cx="7" cy="16" r="2.2" />
          <circle cx="25" cy="16" r="2.2" />
          <path d="M16 14c-3.5 0-6 3-6 5.8 0 2.2 1.7 3.7 3.8 3.7 0.9 0 1.5-0.3 2.2-0.3s1.3 0.3 2.2 0.3c2.1 0 3.8-1.5 3.8-3.7 0-2.8-2.5-5.8-6-5.8z" />
        </svg>
      </div>
      <div className="leading-none">
        <div className={`font-display text-lg font-semibold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
          Veterinaria a domicilio
        </div>
        <div className={`mt-0.5 text-[11px] uppercase tracking-[0.2em] ${light ? 'text-white/60' : 'text-ink-faint'}`}>
          Región de Valparaíso
        </div>
      </div>
    </div>
  )
}
