import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationService, propertyService } from '../../services'
import type { ReservationCreatePayload, Property, AvailabilityResult, PriceCalculation } from '../../types'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

interface FormState {
  propertyId: string
  customerName: string
  customerCedula: string
  customerPhone: string
  customerEmail: string
  dateStart: string
  dateEnd: string
  additionalServices: string[]
  observations: string
}

const initialFormState: FormState = {
  propertyId: '',
  customerName: '',
  customerCedula: '',
  customerPhone: '',
  customerEmail: '',
  dateStart: '',
  dateEnd: '',
  additionalServices: [],
  observations: '',
}

export function ReservationFormPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(initialFormState)
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [serviceTagInput, setServiceTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Availability & price calculation state
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [priceCalc, setPriceCalc] = useState<PriceCalculation | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

  // Debounce timer ref
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await propertyService.getProperties({ active: true })
        setProperties(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar propiedades'
        setSubmitError(message)
      } finally {
        setIsLoadingProperties(false)
      }
    }
    loadProperties()
  }, [])

  // Auto-check availability and calculate price when dates or property change
  useEffect(() => {
    // Clear previous results if dates or property aren't set
    if (!form.propertyId || !form.dateStart || !form.dateEnd) {
      setAvailability(null)
      setPriceCalc(null)
      setCheckError(null)
      return
    }

    // Clear any existing timer
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current)
    }

    // Debounce: wait 500ms after last change
    checkTimerRef.current = setTimeout(async () => {
      setIsChecking(true)
      setCheckError(null)
      try {
        // Check availability
        const avail = await reservationService.checkAvailability(
          form.propertyId,
          new Date(form.dateStart).toISOString(),
          new Date(form.dateEnd).toISOString()
        )
        setAvailability(avail)

        // Calculate price (needs full payload)
        const payload: ReservationCreatePayload = {
          propertyId: form.propertyId,
          customerName: form.customerName || 'temp',
          customerCedula: form.customerCedula || 'temp',
          customerPhone: form.customerPhone || 'temp',
          customerEmail: form.customerEmail || 'temp@temp.com',
          dateStart: new Date(form.dateStart).toISOString(),
          dateEnd: new Date(form.dateEnd).toISOString(),
          additionalServices: form.additionalServices,
          observations: form.observations,
        }
        const price = await reservationService.calculatePrice(payload)
        setPriceCalc(price)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al verificar disponibilidad'
        setCheckError(message)
        setAvailability(null)
        setPriceCalc(null)
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current)
      }
    }
  }, [form.propertyId, form.dateStart, form.dateEnd])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddService = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && serviceTagInput.trim()) {
      e.preventDefault()
      if (!form.additionalServices.includes(serviceTagInput.trim())) {
        setForm((prev) => ({
          ...prev,
          additionalServices: [...prev.additionalServices, serviceTagInput.trim()],
        }))
      }
      setServiceTagInput('')
    }
  }

  const handleRemoveService = (index: number) => {
    setForm((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index),
    }))
  }

  const isFormValid = (): boolean => {
    return (
      Boolean(form.propertyId) &&
      Boolean(form.customerName.trim()) &&
      Boolean(form.customerCedula.trim()) &&
      Boolean(form.customerPhone.trim()) &&
      Boolean(form.customerEmail.trim()) &&
      Boolean(form.dateStart) &&
      Boolean(form.dateEnd) &&
      new Date(form.dateEnd) > new Date(form.dateStart) &&
      availability?.available !== false
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: ReservationCreatePayload = {
        propertyId: form.propertyId,
        customerName: form.customerName,
        customerCedula: form.customerCedula,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        dateStart: new Date(form.dateStart).toISOString(),
        dateEnd: new Date(form.dateEnd).toISOString(),
        additionalServices: form.additionalServices,
        observations: form.observations,
      }

      const reservation = await reservationService.createReservation(payload)
      navigate(`/reservations/${reservation.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear reserva'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProperty = properties.find((p) => p.id === form.propertyId)

  // Loading properties
  if (isLoadingProperties) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Nueva Reserva</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-10 w-full rounded-lg bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nueva Reserva</h2>
        <p className="mt-1 text-sm text-gray-500">
          Registra una nueva reserva en el sistema
        </p>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Property Selector */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Propiedad</h3>
          <div>
            <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
              Seleccionar Propiedad
            </label>
            <select
              id="propertyId"
              name="propertyId"
              value={form.propertyId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">-- Selecciona una propiedad --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatPrice(p.priceNight)}/noche ({p.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento'})
                </option>
              ))}
            </select>
          </div>

          {/* Selected property info */}
          {selectedProperty && (
            <div className="mt-4 rounded-lg bg-primary-50 p-4">
              <p className="text-sm font-medium text-primary-800">{selectedProperty.name}</p>
              <p className="text-xs text-primary-600">
                {selectedProperty.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento'} —{' '}
                Capacidad: {selectedProperty.capacity} personas —{' '}
                {formatPrice(selectedProperty.priceNight)} / noche
              </p>
            </div>
          )}
        </div>

        {/* Customer Data */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Datos del Cliente</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                value={form.customerName}
                onChange={handleChange}
                required
                placeholder="Nombre completo"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="customerCedula" className="block text-sm font-medium text-gray-700">
                Cédula
              </label>
              <input
                id="customerCedula"
                name="customerCedula"
                type="text"
                value={form.customerCedula}
                onChange={handleChange}
                required
                placeholder="Número de cédula"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={handleChange}
                required
                placeholder="Ej: 3001234567"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={form.customerEmail}
                onChange={handleChange}
                required
                placeholder="correo@ejemplo.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Fechas de la Reserva</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700">
                Check-in
              </label>
              <input
                id="dateStart"
                name="dateStart"
                type="date"
                value={form.dateStart}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700">
                Check-out
              </label>
              <input
                id="dateEnd"
                name="dateEnd"
                type="date"
                value={form.dateEnd}
                onChange={handleChange}
                required
                min={form.dateStart || undefined}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Availability & Price Status */}
          {form.propertyId && form.dateStart && form.dateEnd && (
            <div className="mt-4">
              {isChecking ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Verificando disponibilidad...
                </div>
              ) : checkError ? (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {checkError}
                </div>
              ) : availability && priceCalc ? (
                <div className="space-y-3">
                  {/* Availability status */}
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      availability.available
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {availability.available ? (
                      <span className="flex items-center gap-2">
                        ✅ Disponible
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        ❌ No disponible ({availability.conflicts} conflicto(s) con otras reservas)
                      </span>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Resumen de Precios</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Noches</span>
                        <span className="font-medium text-gray-900">{priceCalc.nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Precio por noche</span>
                        <span className="font-medium text-gray-900">{formatPrice(priceCalc.priceNight)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base</span>
                        <span className="font-medium text-gray-900">{formatPrice(priceCalc.basePrice)}</span>
                      </div>
                      {priceCalc.servicesPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Servicios</span>
                          <span className="font-medium text-gray-900">{formatPrice(priceCalc.servicesPrice)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-semibold text-gray-900">{formatPrice(priceCalc.priceTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Additional Services */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Servicios Adicionales</h3>
          <p className="mb-3 text-xs text-gray-400">
            Ingresa los servicios solicitados por el cliente (precios se calculan aparte)
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {form.additionalServices.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-sm text-accent-700"
              >
                {service}
                <button
                  type="button"
                  onClick={() => handleRemoveService(index)}
                  className="ml-1 text-accent-400 hover:text-accent-600"
                  aria-label={`Eliminar ${service}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={serviceTagInput}
            onChange={(e) => setServiceTagInput(e.target.value)}
            onKeyDown={handleAddService}
            placeholder="Escribe un servicio y presiona Enter"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Observations */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Observaciones</h3>
          <textarea
            id="observations"
            name="observations"
            rows={4}
            value={form.observations}
            onChange={handleChange}
            placeholder="Notas adicionales sobre la reserva..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creando...
              </>
            ) : (
              'Crear Reserva'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 border border-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
