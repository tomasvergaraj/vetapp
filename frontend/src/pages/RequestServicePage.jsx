import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { Field, Input, Select, Textarea, Checkbox } from '../components/FormControls'
import { Spinner } from '../components/Loading'
import { FadeInView, BlurText } from '../components/ReactBits'
import {
  createServiceRequest,
  fetchServices,
  fetchCoverageZones,
} from '../lib/endpoints'
import { getErrorMessage } from '../lib/api'
import { formatPrice } from '../lib/format'
import { COMUNAS_POR_PROVINCIA } from '../lib/comunas'

// ---------- Esquema de validación con Zod ----------

const todayISO = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

const formSchema = z
  .object({
    // Cliente
    full_name: z.string().min(2, 'Ingresa tu nombre completo').max(200),
    phone: z
      .string()
      .min(6, 'Teléfono incompleto')
      .max(50)
      .regex(/^[\d+\s-()]+$/, 'Formato de teléfono inválido'),
    email: z.string().email('Correo inválido'),
    address: z.string().min(3, 'Indica una dirección').max(300),
    commune: z.string().min(1, 'Selecciona una comuna'),
    location_reference: z.string().max(500).optional().or(z.literal('')),

    // Mascota
    pet_name: z.string().min(1, 'Ingresa el nombre').max(100),
    pet_type: z.enum(['perro', 'gato', 'otro'], {
      errorMap: () => ({ message: 'Selecciona un tipo' }),
    }),
    breed: z.string().max(150).optional().or(z.literal('')),
    approximate_age_years: z
      .string()
      .optional()
      .refine(
        (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 40),
        'Edad inválida'
      ),
    approximate_weight_kg: z
      .string()
      .optional()
      .refine(
        (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 200),
        'Peso inválido'
      ),
    sex: z.enum(['macho', 'hembra', 'desconocido']),
    pet_notes: z.string().max(1000).optional().or(z.literal('')),

    // Solicitud
    service_id: z.string().min(1, 'Selecciona un servicio'),
    preferred_date: z
      .string()
      .min(1, 'Selecciona una fecha')
      .refine((v) => v >= todayISO(), 'La fecha no puede ser anterior a hoy'),
    preferred_time_start: z.string().optional().or(z.literal('')),
    preferred_time_end: z.string().optional().or(z.literal('')),
    description: z.string().max(2000).optional().or(z.literal('')),
    urgency: z.enum(['baja', 'media', 'alta']),
    accepts_whatsapp: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.preferred_time_start && data.preferred_time_end) {
        return data.preferred_time_start < data.preferred_time_end
      }
      return true
    },
    {
      message: 'El inicio debe ser anterior al fin',
      path: ['preferred_time_end'],
    }
  )

// ---------- Componente ----------

export default function RequestServicePage() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [surchargeMap, setSurchargeMap] = useState({}) // commune name → surcharge amount
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'desconocido',
      pet_type: 'perro',
      urgency: 'baja',
      accepts_whatsapp: true,
      preferred_date: todayISO(),
    },
  })

  useEffect(() => {
    Promise.all([fetchServices().catch(() => []), fetchCoverageZones().catch(() => [])])
      .then(([s, zones]) => {
        setServices(s)
        const map = {}
        zones.forEach((z) => {
          if (z.travel_surcharge && Number(z.travel_surcharge) > 0) {
            map[z.name.trim().toLowerCase()] = Number(z.travel_surcharge)
          }
        })
        setSurchargeMap(map)
      })
      .finally(() => setLoadingMeta(false))
  }, [])

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        client: {
          full_name: values.full_name,
          phone: values.phone,
          email: values.email,
          address: values.address,
          commune: values.commune,
          location_reference: values.location_reference || null,
        },
        pet: {
          name: values.pet_name,
          pet_type: values.pet_type,
          breed: values.breed || null,
          approximate_age_years: values.approximate_age_years
            ? Number(values.approximate_age_years)
            : null,
          approximate_weight_kg: values.approximate_weight_kg
            ? Number(values.approximate_weight_kg)
            : null,
          sex: values.sex,
          notes: values.pet_notes || null,
        },
        service_id: Number(values.service_id),
        preferred_date: values.preferred_date,
        preferred_time_start: values.preferred_time_start || null,
        preferred_time_end: values.preferred_time_end || null,
        description: values.description || null,
        urgency: values.urgency,
        accepts_whatsapp: values.accepts_whatsapp,
      }
      const result = await createServiceRequest(payload)
      reset()
      navigate(`/solicitar/confirmacion?id=${result.id}`, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos enviar tu solicitud.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-32 pb-20">
        <div className="container-edge max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <FadeInView className="mt-6">
            <span className="text-[11px] uppercase tracking-[0.28em] text-brand-600 font-semibold">
              Solicitud de atención
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              <BlurText text="Cuéntanos sobre tu mascota" delay={0.05} />
            </h1>
            <p className="mt-3 text-ink-muted">
              Completa el formulario y la veterinaria revisará tu solicitud para
              confirmar disponibilidad, horario y valor final.
            </p>
          </FadeInView>

          {loadingMeta ? (
            <div className="mt-16 flex justify-center">
              <Spinner className="h-6 w-6 text-brand-700" />
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-10 space-y-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* ============ Sección: Dueño ============ */}
              <FormSection
                step="01"
                title="Datos del dueño"
                description="Cómo podemos contactarte y dónde se realizará la visita."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nombre completo" required error={errors.full_name?.message}>
                    <Input
                      placeholder="María González"
                      error={!!errors.full_name}
                      {...register('full_name')}
                    />
                  </Field>
                  <Field label="Teléfono" required error={errors.phone?.message}>
                    <Input
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      error={!!errors.phone}
                      {...register('phone')}
                    />
                  </Field>
                  <Field label="Correo electrónico" required error={errors.email?.message}>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      error={!!errors.email}
                      {...register('email')}
                    />
                  </Field>
                  <Field label="Comuna" required error={errors.commune?.message}>
                    <Select error={!!errors.commune} {...register('commune')}>
                      <option value="">Selecciona una comuna…</option>
                      {COMUNAS_POR_PROVINCIA.map(({ provincia, comunas }) => (
                        <optgroup key={provincia} label={provincia}>
                          {comunas.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                    <SurchargeNotice commune={watch('commune')} surchargeMap={surchargeMap} />
                  </Field>
                  <Field
                    label="Dirección"
                    required
                    error={errors.address?.message}
                    className="sm:col-span-2"
                  >
                    <Input
                      placeholder="Av. Libertad 123, depto 5B"
                      error={!!errors.address}
                      {...register('address')}
                    />
                  </Field>
                  <Field
                    label="Referencia de ubicación"
                    hint="Opcional. Útil para encontrar el lugar."
                    error={errors.location_reference?.message}
                    className="sm:col-span-2"
                  >
                    <Input
                      placeholder="Frente al parque, edificio celeste"
                      error={!!errors.location_reference}
                      {...register('location_reference')}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* ============ Sección: Mascota ============ */}
              <FormSection
                step="02"
                title="Datos de la mascota"
                description="Información para preparar la atención."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nombre" required error={errors.pet_name?.message}>
                    <Input
                      placeholder="Olivia"
                      error={!!errors.pet_name}
                      {...register('pet_name')}
                    />
                  </Field>
                  <Field label="Tipo de mascota" required error={errors.pet_type?.message}>
                    <Select error={!!errors.pet_type} {...register('pet_type')}>
                      <option value="perro">Perro</option>
                      <option value="gato">Gato</option>
                      <option value="otro">Otro</option>
                    </Select>
                  </Field>
                  <Field label="Raza" error={errors.breed?.message}>
                    <Input
                      placeholder="Mestizo, Siamés, etc."
                      error={!!errors.breed}
                      {...register('breed')}
                    />
                  </Field>
                  <Field label="Sexo" error={errors.sex?.message}>
                    <Select error={!!errors.sex} {...register('sex')}>
                      <option value="desconocido">No especificado</option>
                      <option value="macho">Macho</option>
                      <option value="hembra">Hembra</option>
                    </Select>
                  </Field>
                  <Field
                    label="Edad aproximada (años)"
                    hint="Puedes usar decimales: 0.5 = 6 meses"
                    error={errors.approximate_age_years?.message}
                  >
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="40"
                      placeholder="3.5"
                      error={!!errors.approximate_age_years}
                      {...register('approximate_age_years')}
                    />
                  </Field>
                  <Field
                    label="Peso aproximado (kg)"
                    error={errors.approximate_weight_kg?.message}
                  >
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="200"
                      placeholder="6.5"
                      error={!!errors.approximate_weight_kg}
                      {...register('approximate_weight_kg')}
                    />
                  </Field>
                  <Field
                    label="Observaciones de la mascota"
                    hint="Carácter, alergias, condiciones previas, etc."
                    error={errors.pet_notes?.message}
                    className="sm:col-span-2"
                  >
                    <Textarea
                      rows={3}
                      placeholder="Es nerviosa con extraños, está esterilizada…"
                      error={!!errors.pet_notes}
                      {...register('pet_notes')}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* ============ Sección: Solicitud ============ */}
              <FormSection
                step="03"
                title="Detalles de la atención"
                description="Servicio, fecha y descripción de lo que necesitas."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Servicio"
                    required
                    error={errors.service_id?.message}
                    className="sm:col-span-2"
                  >
                    <Select error={!!errors.service_id} {...register('service_id')}>
                      <option value="">Selecciona un servicio…</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Fecha preferida"
                    required
                    error={errors.preferred_date?.message}
                  >
                    <Input
                      type="date"
                      min={todayISO()}
                      error={!!errors.preferred_date}
                      {...register('preferred_date')}
                    />
                  </Field>
                  <Field label="Urgencia" error={errors.urgency?.message}>
                    <Select error={!!errors.urgency} {...register('urgency')}>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </Select>
                  </Field>
                  <Field
                    label="Horario preferido — desde"
                    hint="Opcional. Es referencial."
                    error={errors.preferred_time_start?.message}
                  >
                    <Input
                      type="time"
                      error={!!errors.preferred_time_start}
                      {...register('preferred_time_start')}
                    />
                  </Field>
                  <Field
                    label="Horario preferido — hasta"
                    error={errors.preferred_time_end?.message}
                  >
                    <Input
                      type="time"
                      error={!!errors.preferred_time_end}
                      {...register('preferred_time_end')}
                    />
                  </Field>
                  <Field
                    label="Descripción"
                    hint="Cuéntanos brevemente la situación o motivo de la consulta."
                    error={errors.description?.message}
                    className="sm:col-span-2"
                  >
                    <Textarea
                      rows={4}
                      placeholder="Mi gata está más decaída de lo normal, come menos…"
                      error={!!errors.description}
                      {...register('description')}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Checkbox
                      label="Acepto ser contactada/o por WhatsApp para coordinar la visita."
                      {...register('accepts_whatsapp')}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Aviso */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 flex-none text-amber-700" />
                  <p className="text-sm text-amber-900/90 leading-relaxed">
                    Este servicio no reemplaza atención veterinaria de urgencia.
                    En caso de emergencia grave, acude a una clínica veterinaria cercana.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-muted">
                  La solicitud entra como pendiente. La veterinaria te contactará para confirmar.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-7 py-3.5 text-base"
                >
                  {submitting ? (
                    <>
                      <Spinner className="h-4 w-4" /> Enviando…
                    </>
                  ) : (
                    <>
                      Enviar solicitud
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function SurchargeNotice({ commune, surchargeMap }) {
  if (!commune) return null
  const surcharge = surchargeMap[commune.trim().toLowerCase()]
  if (!surcharge) return null
  return (
    <motion.div
      key={commune}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-2 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5"
    >
      <span className="mt-0.5 text-amber-500 flex-none">⚠</span>
      <p className="text-xs leading-relaxed text-amber-800">
        Esta comuna tiene un recargo de traslado de{' '}
        <span className="font-semibold">{formatPrice(surcharge)}</span>.
        El monto exacto se confirma al agendar la visita.
      </p>
    </motion.div>
  )
}

function FormSection({ step, title, description, children }) {
  return (
    <section className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-slate-100 shadow-soft">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-brand-50 font-display text-sm font-semibold text-brand-800">
          {step}
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        </div>
      </div>
      <div className="pt-6">{children}</div>
    </section>
  )
}
