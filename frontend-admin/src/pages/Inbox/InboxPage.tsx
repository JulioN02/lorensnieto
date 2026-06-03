import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { leadService } from '../../services'
import type { Lead } from '../../types'
import { LEAD_STATUS, LEAD_STATUS_CONFIG } from '../../types'

type StatusFilter = string | 'todas'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: LEAD_STATUS.NUEVA, label: 'Nuevas' },
  { value: LEAD_STATUS.REVISADA, label: 'Revisadas' },
  { value: LEAD_STATUS.CONVERTIDA, label: 'Convertidas' },
  { value: LEAD_STATUS.DESCARTADA, label: 'Descartadas' },
]

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function InboxPage() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')

  const loadLeads = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: { status?: string } = {}
      if (statusFilter !== 'todas') {
        params.status = statusFilter
      }
      const { data } = await leadService.getLeads(params)
      setLeads(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar solicitudes'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [statusFilter])

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Bandeja de Entrada</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Bandeja de Entrada</h2>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadLeads}
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
        <h2 className="text-2xl font-bold text-gray-900">Bandeja de Entrada</h2>
      </div>

      {/* Status filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
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

      {/* Empty state */}
      {leads.length === 0 ? (
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-lg font-medium text-gray-500">No hay solicitudes</p>
          <p className="mt-1 text-sm text-gray-400">
            {statusFilter !== 'todas'
              ? 'Intenta cambiar el filtro de búsqueda'
              : 'No hay solicitudes de clientes por el momento'}
          </p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Propiedad / Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead, index) => {
                  const statusConfig = LEAD_STATUS_CONFIG[lead.status] ?? { label: lead.status, color: 'bg-gray-100 text-gray-800' }
                  const isNew = lead.status === LEAD_STATUS.NUEVA
                  return (
                    <tr
                      key={lead.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer transition-colors hover:bg-primary-50/50 ${isNew ? 'font-semibold' : ''}`}
                      onClick={() => navigate(`/inbox/${lead.id}`)}
                    >
                      {/* Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      {/* Customer */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className={`text-sm ${isNew ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                          {lead.customerName}
                        </p>
                      </td>
                      {/* Contact */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {lead.customerPhone}
                      </td>
                      {/* Property / Service */}
                      <td className="whitespace-nowrap px-6 py-4">
                        {lead.property ? (
                          <div>
                            <p className={`text-sm ${isNew ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                              {lead.property.name}
                            </p>
                            <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {lead.property.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento'}
                            </span>
                          </div>
                        ) : lead.service ? (
                          <div>
                            <p className={`text-sm ${isNew ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                              {lead.service.name}
                            </p>
                            <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                              {lead.service.classification}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/inbox/${lead.id}`)
                          }}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary-50"
                        >
                          Ver detalle
                        </button>
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
