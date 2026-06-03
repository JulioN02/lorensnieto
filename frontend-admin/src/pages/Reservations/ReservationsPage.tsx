import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationService, propertyService } from '../../services'
import { StatusBadge } from '../../components/StatusBadge'
import type { Reservation, Property } from '../../types'
import { RESERVATION_STATUS } from '../../types'

type StatusFilter = string | 'todas'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: RESERVATION_STATUS.PENDIENTE, label: 'Pendientes' },
  { value: RESERVATION_STATUS.CONFIRMADA, label: 'Confirmadas' },
  { value: RESERVATION_STATUS.EN_SERVICIO, label: 'En Servicio' },
  { value: RESERVATION_STATUS.FINALIZADA, label: 'Finalizadas' },
  { value: RESERVATION_STATUS.CANCELADA, label: 'Canceladas' },
]

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
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

function calculateNights(dateStart: string, dateEnd: string): number {
  const start = new Date(dateStart)
  const end = new Date(dateEnd)
  const diff = end.getTime() - start.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

export function ReservationsPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')
  const [propertyFilter, setPropertyFilter] = useState<string>('')

  const loadReservations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: { status?: string; propertyId?: string } = {}
      if (statusFilter !== 'todas') {
        params.status = statusFilter
      }
      if (propertyFilter) {
        params.propertyId = propertyFilter
      }
      const data = await reservationService.getReservations(params)
      setReservations(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar reservas'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [statusFilter, propertyFilter])

  const loadProperties = async () => {
    try {
      const data = await propertyService.getProperties({ active: true })
      setProperties(data)
    } catch {
      // Properties loading is optional for the filter, ignore errors
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const handleCancel = async (reservation: Reservation) => {
    if (!window.confirm(`¿Estás segura de cancelar la reserva de ${reservation.customerName}?`)) return
    try {
      await reservationService.cancelReservation(reservation.id)
      setReservations((prev) =>
        prev.map((r) => (r.id === reservation.id ? { ...r, status: RESERVATION_STATUS.CANCELADA } : r))
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar reserva'
      alert(message)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div className="h-4 w-56 rounded bg-gray-200" />
                <div className="h-3 w-40 rounded bg-gray-200" />
                <div className="h-3 w-32 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadReservations}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
        <button
          type="button"
          onClick={() => navigate('/reservations/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Reserva
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Status filter buttons */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Property filter dropdown */}
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:w-64"
        >
          <option value="">Todas las propiedades</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {reservations.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-500">No hay reservas</p>
          <p className="mt-1 text-sm text-gray-400">
            {statusFilter !== 'todas' || propertyFilter
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Comienza creando una nueva reserva'}
          </p>
          {statusFilter === 'todas' && !propertyFilter && (
            <button
              type="button"
              onClick={() => navigate('/reservations/new')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Crear primera reserva
            </button>
          )}
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Check-in → Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Noches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Pagos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((reservation, index) => {
                  const nights = calculateNights(reservation.dateStart, reservation.dateEnd)
                  const paymentCount = reservation._count?.payments ?? 0
                  return (
                    <tr
                      key={reservation.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer transition-colors hover:bg-primary-50/50`}
                      onClick={() => navigate(`/reservations/${reservation.id}`)}
                    >
                      {/* Customer */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{reservation.customerName}</p>
                      </td>
                      {/* Property */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-sm text-gray-900">{reservation.property.name}</p>
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {reservation.property.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento'}
                        </span>
                      </td>
                      {/* Date range */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(reservation.dateStart)} → {formatDate(reservation.dateEnd)}
                      </td>
                      {/* Nights */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {nights}
                      </td>
                      {/* Total */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {formatPrice(reservation.priceTotal)}
                      </td>
                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={reservation.status} size="sm" />
                      </td>
                      {/* Payments count */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {paymentCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            {paymentCount} pago(s)
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/reservations/${reservation.id}`)
                            }}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-50"
                          >
                            Ver detalle
                          </button>
                          {reservation.status === RESERVATION_STATUS.PENDIENTE && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancel(reservation)
                              }}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
