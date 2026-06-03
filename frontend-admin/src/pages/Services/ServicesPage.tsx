import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { serviceService } from '../../services'
import type { Service, ServiceClassification } from '../../types'
import { SERVICE_CLASSIFICATIONS, SERVICE_CLASSIFICATION_LABELS } from '../../types'

type FilterType = ServiceClassification | 'todas'

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'todas', label: 'Todos' },
  { value: SERVICE_CLASSIFICATIONS.ALIMENTACION, label: 'Alimentación' },
  { value: SERVICE_CLASSIFICATIONS.LIMPIEZA, label: 'Limpieza' },
  { value: SERVICE_CLASSIFICATIONS.OTROS, label: 'Otros' },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function getImageUrl(service: Service): string | null {
  if (service.media.length > 0 && service.media[0]) {
    return service.media[0].url
  }
  return null
}

export function ServicesPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<FilterType>('todas')
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  const loadServices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: { classification?: string; active?: boolean } = {}
      if (filterType !== 'todas') {
        params.classification = filterType
      }
      const data = await serviceService.getServices(params)
      setServices(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar servicios'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [filterType])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  const handleToggleActive = async (service: Service) => {
    setTogglingIds((prev) => new Set(prev).add(service.id))
    try {
      const formData = new FormData()
      formData.append('active', String(!service.active))
      await serviceService.updateService(service.id, formData)
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s))
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar servicio'
      alert(message)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(service.id)
        return next
      })
    }
  }

  const handleDelete = async (service: Service) => {
    if (!window.confirm(`¿Estás segura de eliminar "${service.name}"?`)) return
    try {
      await serviceService.deleteService(service.id)
      setServices((prev) => prev.filter((s) => s.id !== service.id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar servicio'
      alert(message)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-gray-200" />
                  <div className="h-3 w-32 rounded bg-gray-200" />
                </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadServices}
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
        <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
        <button
          type="button"
          onClick={() => navigate('/services/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Servicio
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilterType(option.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterType === option.value
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {services.length === 0 ? (
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">No hay servicios registrados</p>
          <p className="mt-1 text-sm text-gray-400">Comienza creando un nuevo servicio</p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Clasificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Activo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((service, index) => {
                  const imageUrl = getImageUrl(service)
                  return (
                    <tr
                      key={service.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors hover:bg-primary-50/50`}
                    >
                      {/* Image thumbnail */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={service.name}
                            className="h-14 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100">
                            <svg
                              className="h-6 w-6 text-gray-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                      {/* Name */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      {/* Classification */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          {SERVICE_CLASSIFICATION_LABELS[service.classification]}
                        </span>
                      </td>
                      {/* Type */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {service.type}
                      </td>
                      {/* Price */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {formatPrice(service.price)}
                      </td>
                      {/* Active toggle */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(service)}
                          disabled={togglingIds.has(service.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                            service.active ? 'bg-green-500' : 'bg-gray-300'
                          } ${togglingIds.has(service.id) ? 'opacity-50' : ''}`}
                          role="switch"
                          aria-checked={service.active}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              service.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/services/${service.id}/edit`)}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(service)}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Eliminar
                          </button>
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
