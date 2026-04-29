import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────
// BlurText — cada palabra entra con blur + fade
// ─────────────────────────────────────────────
export function BlurText({ text, className = '', delay = 0, as: Tag = 'span' }) {
  const words = text.split(' ')
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </Tag>
  )
}

// ─────────────────────────────────────────────
// GradientText — texto con gradiente animado
// ─────────────────────────────────────────────
export function GradientText({ children, className = '' }) {
  return (
    <span
      className={`bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────
// SpotlightCard — card con efecto spotlight de mouse
// ─────────────────────────────────────────────
export function SpotlightCard({ children, className = '', spotlightColor = 'rgba(20,184,166,0.10)' }) {
  const cardRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`)
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      style={{ '--spotlight-color': spotlightColor }}
      className={`spotlight-card ${className}`}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// CountUp — número animado al entrar en viewport
// ─────────────────────────────────────────────
export function CountUp({ to, suffix = '', duration = 1.8 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const tick = (now) => {
            const t = Math.min((now - startTime) / (duration * 1000), 1)
            const ease = 1 - Math.pow(1 - t, 3)
            setCount(Math.round(to * ease))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [to, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

// ─────────────────────────────────────────────
// FadeInView — wrapper para animaciones al scroll
// ─────────────────────────────────────────────
export function FadeInView({ children, delay = 0, direction = 'up', className = '' }) {
  const yMap = { up: 24, down: -24, left: 24, right: -24 }
  const xMap = { left: -24, right: 24, up: 0, down: 0 }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yMap[direction] ?? 24, x: xMap[direction] ?? 0 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// StaggerList — lista con animación en cascada
// ─────────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}
const staggerItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

export function StaggerList({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// AnimatedAccordion — acordeón con framer-motion
// ─────────────────────────────────────────────
export function AnimatedAccordion({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="divide-y divide-slate-200">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center justify-between gap-4 py-6 text-left group"
          >
            <span className="font-display text-lg font-medium text-ink group-hover:text-brand-700 transition-colors">
              {item.q}
            </span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-none text-brand-600 text-2xl leading-none font-light"
            >
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="pb-6 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// FloatCard — tarjeta con efecto float CSS
// ─────────────────────────────────────────────
export function FloatCard({ children, className = '', delay = '0s' }) {
  return (
    <div
      className={`float-card ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// AuroraBackground — fondo con gradientes animados
// ─────────────────────────────────────────────
export function AuroraBackground({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div aria-hidden="true" className="aurora-bg pointer-events-none absolute inset-0 -z-10" />
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// MagneticButton — botón con efecto magnético
// ─────────────────────────────────────────────
export function MagneticButton({ children, className = '', strength = 0.3, ...props }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    })
  }

  const handleMouseLeave = () => setPos({ x: 0, y: 0 })

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}
