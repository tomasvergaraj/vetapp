import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Shield,
  Stethoscope,
  Syringe,
  Star,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import {
  BlurText,
  GradientText,
  SpotlightCard,
  CountUp,
  FadeInView,
  StaggerList,
  StaggerItem,
  AnimatedAccordion,
  FloatCard,
  AuroraBackground,
} from '../components/ReactBits'
import { fetchCoverageZones, fetchServices } from '../lib/endpoints'
import { formatPrice, formatPriceFrom, SERVICE_CATEGORY_LABELS } from '../lib/format'
import { Spinner } from '../components/Loading'

// ─── Datos estáticos ───────────────────────────────────────────────────────────

const benefits = [
  {
    icon: Heart,
    title: 'Atención personalizada',
    text: 'Cada visita se adapta al carácter, edad y necesidad de tu mascota.',
    color: 'from-rose-50 to-rose-100/50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: Home,
    title: 'Evita traslados innecesarios',
    text: 'Sin estrés de viaje ni salas de espera con otros animales.',
    color: 'from-amber-50 to-amber-100/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    icon: PawPrint,
    title: 'Ideal para mascotas nerviosas',
    text: 'Perros mayores, gatos ariscos o pacientes en recuperación.',
    color: 'from-violet-50 to-violet-100/50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    icon: Calendar,
    title: 'Agenda flexible',
    text: 'Coordinamos día y horario que te acomoden, no al revés.',
    color: 'from-brand-50 to-brand-100/50',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-600',
  },
  {
    icon: MessageCircle,
    title: 'Seguimiento cercano',
    text: 'Contacto directo por WhatsApp después de cada atención.',
    color: 'from-emerald-50 to-emerald-100/50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Profesional independiente',
    text: 'Una sola veterinaria de confianza que conoce a tu mascota.',
    color: 'from-sky-50 to-sky-100/50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
]

const steps = [
  {
    n: '01',
    icon: PawPrint,
    title: 'Solicita la atención',
    text: 'Completa el formulario con los datos de tu mascota, el servicio y la fecha preferida.',
  },
  {
    n: '02',
    icon: MessageCircle,
    title: 'Coordinamos contigo',
    text: 'La veterinaria revisa tu solicitud y se contacta para confirmar disponibilidad y valor.',
  },
  {
    n: '03',
    icon: Home,
    title: 'Visita en tu hogar',
    text: 'Atención profesional en el lugar y horario acordado, sin estrés para tu mascota.',
  },
  {
    n: '04',
    icon: CheckCircle2,
    title: 'Seguimiento',
    text: 'Recibirás indicaciones por escrito y podrás consultar dudas posteriores.',
  },
]

const faqs = [
  {
    q: '¿En qué comunas atienden?',
    a: 'Atendemos en toda la Región de Valparaíso. Más abajo en esta página puedes ver el listado actualizado de zonas y posibles recargos por traslado.',
  },
  {
    q: '¿Cuánto cuesta la visita?',
    a: 'El valor depende del servicio, la comuna y los insumos requeridos. Algunos servicios tienen un precio base referencial; en otros el valor se confirma al revisar tu solicitud.',
  },
  {
    q: '¿Cuándo se confirma la fecha y hora?',
    a: 'La solicitud entra como pendiente y la veterinaria se pone en contacto contigo para confirmar disponibilidad. La hora preferida que indicas es referencial, no se reserva automáticamente.',
  },
  {
    q: '¿Atienden urgencias?',
    a: 'No somos un servicio de urgencias 24/7. En caso de emergencia grave (accidente, sangrado, dificultad respiratoria), acude directamente a una clínica veterinaria cercana.',
  },
  {
    q: '¿Qué animales atienden?',
    a: 'Principalmente perros y gatos. Para otras especies, escríbenos antes para evaluar si podemos ayudarte.',
  },
  {
    q: '¿Cómo se pagan los servicios?',
    a: 'Por ahora el pago se acuerda directamente con la veterinaria al confirmar la atención. Estamos preparando pagos en línea para próximas versiones.',
  },
]

// Stats base — algunos se sobreescriben con datos reales de la API
const BASE_STATS = [
  { key: 'atenciones', value: 200, suffix: '+', label: 'Mascotas atendidas' },
  { key: 'zonas',      value: 0,   suffix: '',  label: 'Comunas de cobertura' },
  { key: 'servicios',  value: 0,   suffix: '',  label: 'Servicios disponibles' },
  { key: 'respuesta',  value: 24,  suffix: 'h', label: 'Tiempo de respuesta' },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LandingPage() {
  const [services, setServices] = useState([])
  const [zones, setZones] = useState([])
  const [stats, setStats] = useState(BASE_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchServices().catch(() => []), fetchCoverageZones().catch(() => [])])
      .then(([s, z]) => {
        setServices(s)
        setZones(z)
        setStats(BASE_STATS.map((st) => {
          if (st.key === 'zonas') return { ...st, value: z.length }
          if (st.key === 'servicios') return { ...st, value: s.length }
          return st
        }))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <AuroraBackground className="pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Orbe extra en el centro-derecha */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 h-96 w-96 rounded-full bg-brand-300/20 blur-3xl animate-aurora3"
        />
        {/* Grid decorativo */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-[0.025] pointer-events-none"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="container-edge relative">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-center">

            {/* Columna texto */}
            <div>
              {/* Badge animado */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-brand-800 backdrop-blur-sm shadow-soft">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  Atención disponible · Región de Valparaíso
                </span>
              </motion.div>

              {/* Título con BlurText */}
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
                <BlurText text="Atención veterinaria" delay={0.15} />
                <br />
                <span className="block mt-1">
                  <motion.span
                    className="shimmer-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    a domicilio
                  </motion.span>
                  <BlurText as="span" text=" para tu mascota" delay={0.55} />
                </span>
              </h1>

              <FadeInView delay={0.6}>
                <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
                  Solicita servicios veterinarios de forma simple, rápida y personalizada.
                  Atención profesional para perros y gatos, directamente en tu hogar.
                </p>
              </FadeInView>

              <FadeInView delay={0.75} className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link to="/solicitar" className="btn-primary justify-center text-base px-8 py-4 rounded-2xl">
                  Solicitar atención
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#servicios" className="btn-secondary justify-center text-base px-8 py-4 rounded-2xl">
                  Ver servicios
                </a>
              </FadeInView>

              {/* Trust row */}
              <FadeInView delay={0.9} className="mt-10 flex flex-wrap items-center gap-5 border-t border-slate-200/80 pt-6 text-sm text-ink-muted">
                {['Sin traslados', 'Profesional certificada', 'Agenda flexible'].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                    {t}
                  </div>
                ))}
              </FadeInView>
            </div>

            {/* Columna visual */}
            <FloatCard className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glow de fondo */}
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-brand-300/25 to-brand-500/15 blur-3xl" />

              {/* Tarjeta principal — glassmorphism */}
              <div className="relative rounded-3xl glass p-8 shadow-card ring-1 ring-white/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                      <Stethoscope className="h-5 w-5 text-brand-700" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">Próxima visita</div>
                      <div className="text-xs text-ink-muted">Consulta general</div>
                    </div>
                  </div>
                  <span className="badge bg-brand-100 text-brand-800 font-medium">Confirmada</span>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                  <HeroRow icon={Calendar} label="Sábado, 18 de mayo · 10:30" />
                  <HeroRow icon={MapPin} label="Viña del Mar — Av. Libertad" />
                  <HeroRow icon={PawPrint} label="Olivia · Gata · 7 años" />
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/60 p-4">
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-brand-700" />
                    <div className="text-xs font-semibold text-brand-800">Indicaciones previas</div>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-brand-700/80">
                    Mantén a Olivia en una habitación tranquila 30 minutos antes de la visita.
                  </p>
                </div>
              </div>

              {/* Mini-tarjeta flotante inferior */}
              <FloatCard
                delay="1.5s"
                className="absolute -bottom-6 -left-6 hidden lg:block"
              >
                <div className="glass-dark rounded-2xl p-4 shadow-card">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Vacunación</div>
                  <div className="mt-1 font-display text-base text-white">Recordatorio en 30 días</div>
                </div>
              </FloatCard>

              {/* Chip de reseña */}
              <FloatCard delay="0.8s" className="absolute -top-4 -right-4 hidden lg:flex items-center gap-2 glass rounded-2xl px-4 py-2.5 shadow-soft">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-medium text-ink">Excelente servicio</span>
              </FloatCard>
            </FloatCard>
          </div>

          {/* ── Stats ─────────────────────────────────── */}
          <StaggerList className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ value, suffix, label }) => (
              <StaggerItem key={label}>
                <div className="rounded-2xl glass px-6 py-5 text-center shadow-soft ring-1 ring-white/60">
                  <div className="font-display text-3xl font-semibold text-brand-700 tabular-nums">
                    <CountUp to={value} suffix={suffix} />
                  </div>
                  <div className="mt-1 text-xs text-ink-muted">{label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </AuroraBackground>

      {/* ══════════════════════════════════════════
          SERVICIOS
      ══════════════════════════════════════════ */}
      <section id="servicios" className="py-28 sm:py-36 bg-white">
        <div className="container-edge">
          <FadeInView>
            <SectionHeader
              eyebrow="Servicios"
              title="Atención profesional, sin que tengas que salir de casa"
              description="Servicios veterinarios para el cuidado preventivo y de rutina de perros y gatos. Para procedimientos complejos o de urgencia, te derivamos a una clínica."
            />
          </FadeInView>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-brand-700" />
            </div>
          ) : (
            <StaggerList className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <StaggerItem key={s.id}>
                  <SpotlightCard className="h-full group rounded-3xl bg-white ring-1 ring-slate-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-7">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-brand-600">
                      {SERVICE_CATEGORY_LABELS[s.category] || 'Servicio'}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-ink leading-tight">
                      {s.name}
                    </h3>
                    {s.description && (
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted line-clamp-3">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-faint">Valor</div>
                        <div className="mt-0.5 text-sm font-semibold text-ink">
                          {formatPriceFrom(s.base_price)}
                        </div>
                      </div>
                      {s.estimated_duration_minutes && (
                        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <Clock className="h-3.5 w-3.5" />
                          {s.estimated_duration_minutes} min
                        </div>
                      )}
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              ))}
            </StaggerList>
          )}

          <FadeInView delay={0.2} className="mt-12 flex justify-center">
            <Link to="/solicitar" className="btn-primary px-8 py-4 rounded-2xl text-base gap-2">
              Solicitar un servicio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeInView>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CÓMO FUNCIONA
      ══════════════════════════════════════════ */}
      <section id="como-funciona" className="relative py-28 sm:py-36 overflow-hidden">
        {/* Fondo con gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas-subtle via-white to-canvas-subtle -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-100/40 rounded-full blur-3xl -z-10" />

        <div className="container-edge">
          <FadeInView>
            <SectionHeader
              eyebrow="Cómo funciona"
              title="Cuatro pasos simples"
              description="Desde tu solicitud hasta el seguimiento posterior, así trabajamos contigo y tu mascota."
            />
          </FadeInView>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
            {/* Línea conectora */}
            <div className="hidden lg:block absolute top-12 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />

            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <FadeInView key={step.n} delay={i * 0.12}>
                  <div className="relative flex flex-col items-start lg:items-center lg:text-center">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-brand-100 z-10">
                      <Icon className="h-6 w-6 text-brand-600" />
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {step.text}
                    </p>
                  </div>
                </FadeInView>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BENEFICIOS
      ══════════════════════════════════════════ */}
      <section className="py-28 sm:py-36 bg-white">
        <div className="container-edge">
          <FadeInView>
            <SectionHeader
              eyebrow="Beneficios"
              title="Una atención pensada para tu mascota"
              description="Lo que distingue a un servicio a domicilio de una visita a la clínica tradicional."
            />
          </FadeInView>

          <StaggerList className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text, color, iconBg, iconColor }) => (
              <StaggerItem key={title}>
                <SpotlightCard className={`h-full rounded-3xl bg-gradient-to-br ${color} p-8 ring-1 ring-slate-100/80 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5`}>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ZONAS
      ══════════════════════════════════════════ */}
      <section id="zonas" className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-ink -z-10" />
        {/* Orbes decorativos */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-700/20 blur-3xl -z-10 animate-aurora1" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-3xl -z-10 animate-aurora2" />

        <div className="container-edge">
          <FadeInView>
            <SectionHeader
              eyebrow="Zonas de atención"
              title="Región de Valparaíso"
              description="Atendemos en estas comunas. Algunas tienen un recargo por traslado, que se confirma al recibir tu solicitud."
              dark
            />
          </FadeInView>

          {loading ? (
            <div className="mt-12 flex justify-center">
              <Spinner className="h-6 w-6 text-brand-300" />
            </div>
          ) : zones.length === 0 ? (
            <p className="mt-12 text-center text-sm text-white/50">
              Por ahora no hay zonas activas. Contáctanos para coordinar.
            </p>
          ) : (
            <>
              <StaggerList className="mt-14 flex flex-wrap justify-center gap-3">
                {zones.map((z) => {
                  const surcharge = z.travel_surcharge && Number(z.travel_surcharge) > 0
                    ? Number(z.travel_surcharge)
                    : null
                  return (
                    <StaggerItem key={z.id}>
                      <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur-sm transition-colors cursor-default ${
                        surcharge
                          ? 'border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-white/90'
                          : 'border-white/10 bg-white/10 hover:bg-white/20 text-white/90'
                      }`}>
                        <MapPin className={`h-3.5 w-3.5 ${surcharge ? 'text-amber-300' : 'text-brand-300'}`} />
                        {z.name}
                        {surcharge && (
                          <span className="text-xs font-medium text-amber-300">
                            + {formatPrice(surcharge)}
                          </span>
                        )}
                      </span>
                    </StaggerItem>
                  )
                })}
              </StaggerList>
              {zones.some((z) => z.travel_surcharge && Number(z.travel_surcharge) > 0) && (
                <FadeInView delay={0.3} className="mt-8 flex justify-center">
                  <p className="flex items-center gap-2 text-xs text-white/40">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                    Las comunas en naranja tienen recargo por traslado, confirmado al agendar.
                  </p>
                </FadeInView>
              )}
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section id="preguntas" className="py-28 sm:py-36 bg-white">
        <div className="container-edge max-w-4xl">
          <FadeInView>
            <SectionHeader
              eyebrow="Preguntas frecuentes"
              title="Lo que más nos consultan"
              align="left"
            />
          </FadeInView>
          <FadeInView delay={0.15} className="mt-14">
            <AnimatedAccordion items={faqs} />
          </FadeInView>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          AVISO + CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="pb-28">
        <div className="container-edge space-y-10">
          {/* Aviso */}
          <FadeInView>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-900">Aviso importante</h3>
                  <p className="mt-1 text-sm text-amber-800/90">
                    Este servicio no reemplaza atención veterinaria de urgencia. En caso
                    de emergencia grave, acude a una clínica veterinaria cercana.
                  </p>
                </div>
              </div>
            </div>
          </FadeInView>

          {/* CTA Final */}
          <FadeInView>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 px-8 py-20 text-center sm:px-16">
              {/* Orbes decorativos internos */}
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-700/30 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-96 bg-brand-400/10 blur-2xl rounded-full" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-300 mb-6">
                  <PawPrint className="h-3.5 w-3.5" />
                  Solicita ahora
                </span>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  ¿Listo para agendar la visita?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-balance text-white/60">
                  Completa el formulario y la veterinaria te contactará para confirmar
                  disponibilidad y valor.
                </p>
                <Link
                  to="/solicitar"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-8 py-4 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-400 hover:shadow-lg active:scale-95"
                >
                  Solicitar atención
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

// ─── Subcomponentes locales ───────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, description, align = 'center', dark = false }) {
  const textColor = dark ? 'text-white' : 'text-ink'
  const mutedColor = dark ? 'text-white/60' : 'text-ink-muted'
  const eyebrowColor = dark ? 'text-brand-300' : 'text-brand-600'
  return (
    <div className={align === 'left' ? 'max-w-3xl' : 'mx-auto max-w-3xl text-center'}>
      <span className={`text-[11px] uppercase tracking-[0.28em] font-semibold ${eyebrowColor}`}>
        {eyebrow}
      </span>
      <h2 className={`mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl ${textColor}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-pretty text-base leading-relaxed ${mutedColor}`}>
          {description}
        </p>
      )}
    </div>
  )
}

function HeroRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink-soft">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
        <Icon className="h-3.5 w-3.5 text-brand-600" />
      </div>
      {label}
    </div>
  )
}
