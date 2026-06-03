import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { propertyService } from '../../services'
import type { Property, PropertyType } from '../../types'
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from '../../types'

type FilterType = PropertyType | 'todas'

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: PROPERTY_TYPES.CASA_CAMPO, label: 'Casas de Campo' },
  { value: PROPERTY_TYPES.APARTAMENTO, label: 'Apartamentos' },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function getImageUrl(property: Property): string | null {
  if (property.media.length > 0 && property.media[0]) {
    return property.media[0].url
  }
  return null
}

export function PropertiesPage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<FilterType>('todas')
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  const loadProperties = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: { type?: string; active?: boolean } = {}
      if (filterType !== 'todas') {
        params.type = filterType
      }
      const data = await propertyService.getProperties(params)
      setProperties(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar propiedades'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [filterType])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  const handleToggleActive = async (property: Property) => {
    setTogglingIds((prev) => new Set(prev).add(property.id))
    try {
      const formData = new FormData()
      formData.append('active', String(!property.active))
      await propertyService.updateProperty(property.id, formData)
      setProperties((prev) =>
        prev.map((p) => (p.id === property.id ? { ...p, active: !p.active } : p))
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar propiedad'
      alert(message)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(property.id)
        return next
      })
    }
  }

  const handleDelete = async (property: Property) => {
    if (!window.confirm(`¿Estás segura de eliminar "${property.name}"?`)) return
    try {
      await propertyService.deleteProperty(property.id)
      setProperties((prev) => prev.filter((p) => p.id !== property.id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar propiedad'
      alert(message)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Propiedades</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Propiedades</h2>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadProperties}
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
        <h2 className="text-2xl font-bold text-gray-900">Propiedades</h2>
        <button
          type="button"
          onClick={() => navigate('/properties/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Propiedad
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
      {properties.length === 0 ? (
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <p className="text-lg font-medium text-gray-500">No hay propiedades registradas</p>
          <p className="mt-1 text-sm text-gray-400">Comienza creando una nueva propiedad</p>
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
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Capacidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Precio/Noche
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
                {properties.map((property, index) => {
                  const imageUrl = getImageUrl(property)
                  return (
                    <tr
                      key={property.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors hover:bg-primary-50/50`}
                    >
                      {/* Image thumbnail */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={property.name}
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
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{property.name}</p>
                        <p className="text-xs text-gray-500">
                          {property._count?.reservations ?? 0} reserva(s)
                        </p>
                      </td>
                      {/* Type */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {PROPERTY_TYPE_LABELS[property.type]}
                        </span>
                      </td>
                      {/* Zone */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {property.zone}
                      </td>
                      {/* Capacity */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {property.capacity} pers.
                      </td>
                      {/* Price */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {formatPrice(property.priceNight)}
                      </td>
                      {/* Active toggle */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(property)}
                          disabled={togglingIds.has(property.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                            property.active ? 'bg-green-500' : 'bg-gray-300'
                          } ${togglingIds.has(property.id) ? 'opacity-50' : ''}`}
                          role="switch"
                          aria-checked={property.active}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              property.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/properties/${property.id}/edit`)}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(property)}
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
