import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reservationService } from '../../services'
import { StatusBadge } from '../../components/StatusBadge'
import { PaymentModal } from '../../components/PaymentModal'
import type { Reservation, Payment } from '../../types'
import { STATUS_ACTIONS, RESERVATION_STATUS } from '../../types'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

function calculateNights(dateStart: string, dateEnd: string): number {
  const start = new Date(dateStart)
  const end = new Date(dateEnd)
  const diff = end.getTime() - start.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [observations, setObservations] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])

  const loadReservation = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await reservationService.getReservation(id)
      setReservation(data)
      setObservations(data.observations)
      setPayments(data.payments ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar reserva'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservation()
  }, [id])

  const handleStatusChange = async (nextStatus: string) => {
    if (!reservation) return

    const actionLabel = STATUS_ACTIONS[reservation.status]?.find((a) => a.nextStatus === nextStatus)?.label ?? 'cambiar estado'
    const isCancel = nextStatus === RESERVATION_STATUS.CANCELADA
    const confirmMsg = isCancel
      ? `¿Estás segura de cancelar esta reserva?`
      : `¿Estás segura de ${actionLabel.toLowerCase()}?`

    if (!window.confirm(confirmMsg)) return

    setIsChangingStatus(true)
    try {
      if (nextStatus === RESERVATION_STATUS.CANCELADA) {
        await reservationService.cancelReservation(reservation.id)
      } else {
        await reservationService.updateReservation(reservation.id, { status: nextStatus as Reservation['status'] })
      }
      setReservation((prev) => (prev ? { ...prev, status: nextStatus as Reservation['status'] } : null))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado'
      alert(message)
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleSaveObservations = async () => {
    if (!reservation) return
    setIsSaving(true)
    try {
      await reservationService.updateReservation(reservation.id, { observations })
      alert('Observaciones guardadas exitosamente')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar observaciones'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a reservas
          </button>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadReservation}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!reservation) {
    return null
  }

  const nights = calculateNights(reservation.dateStart, reservation.dateEnd)
  const pricePerNight = reservation.property.priceNight
    ? reservation.priceTotal / nights
    : 0
  const actions = STATUS_ACTIONS[reservation.status] ?? []
  const totalPaid = payments
    .filter((p) => p.status === 'pagado')
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingBalance = reservation.priceTotal - totalPaid
  const paymentProgress = reservation.priceTotal > 0 ? (totalPaid / reservation.priceTotal) * 100 : 0

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/reservations')}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a reservas
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{reservation.property.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {reservation.property.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento'}
              </span>
              <span className="text-xs text-gray-400">
                ID: {reservation.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={reservation.status} size="lg" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información del Cliente</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Nombre</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Cédula</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.customerCedula}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Teléfono</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.customerPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.customerEmail}</dd>
            </div>
          </dl>
        </div>

        {/* Reservation Info */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información de la Reserva</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Propiedad</dt>
              <dd className="text-sm font-medium text-gray-900">{reservation.property.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Check-in</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(reservation.dateStart)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Check-out</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(reservation.dateEnd)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Noches</dt>
              <dd className="text-sm font-medium text-gray-900">{nights}</dd>
            </div>
            {reservation.additionalServices.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Servicios adicionales</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {reservation.additionalServices.join(', ')}
                </dd>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Precio por noche</dt>
                <dd className="text-sm text-gray-900">{formatPrice(pricePerNight)}</dd>
              </div>
              <div className="mt-2 flex justify-between">
                <dt className="text-base font-semibold text-gray-900">Total</dt>
                <dd className="text-base font-semibold text-gray-900">
                  {formatPrice(reservation.priceTotal)}
                </dd>
              </div>
            </div>
          </dl>
          <p className="mt-4 text-xs text-gray-400">
            Creada: {formatDateTime(reservation.createdAt)}
          </p>
        </div>

        {/* Payments Section */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pagos</h3>
            {pendingBalance > 0 && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Registrar Pago
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-medium text-gray-900">{formatPrice(reservation.priceTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pagado</span>
              <span className="font-medium text-green-700">{formatPrice(totalPaid)}</span>
            </div>
            {pendingBalance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pendiente</span>
                <span className="font-medium text-red-600">{formatPrice(pendingBalance)}</span>
              </div>
            )}
            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {Math.round(paymentProgress)}%
                </span>
              </div>
            </div>
          </div>

          {payments.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Monto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900">
                          {formatPrice(payment.amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                          {payment.type === 'abono' ? 'Abono' : 'Total'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              payment.status === 'pagado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payment.status === 'pagado' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-sm text-gray-500">No hay pagos registrados</p>
            </div>
          )}
        </div>

        {/* Status Actions + Observations */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Acciones</h3>

          {/* Status transition buttons */}
          {actions.length > 0 ? (
            <div className="mb-6 space-y-2">
              <p className="text-sm font-medium text-gray-600">Cambiar estado:</p>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <button
                    key={action.nextStatus}
                    type="button"
                    onClick={() => handleStatusChange(action.nextStatus)}
                    disabled={isChangingStatus}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${action.color}`}
                  >
                    {isChangingStatus ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
              {reservation.status === RESERVATION_STATUS.FINALIZADA
                ? 'Esta reserva ha sido finalizada. No hay acciones disponibles.'
                : 'Esta reserva ha sido cancelada. No hay acciones disponibles.'}
            </div>
          )}

          {/* Observations */}
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              id="observations"
              rows={4}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Agregar observaciones..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              onClick={handleSaveObservations}
              disabled={isSaving}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                'Guardar Observaciones'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && id && (
        <PaymentModal
          reservationId={id}
          pendingBalance={pendingBalance}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false)
            loadReservation()
          }}
        />
      )}
    </div>
  )
}
