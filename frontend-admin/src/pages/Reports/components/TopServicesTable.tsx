import type { TopService } from '../../../types/report'

interface TopServicesTableProps {
  data: TopService[]
  isLoading: boolean
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  alimentacion: 'Alimentación',
  limpieza: 'Limpieza',
  otros: 'Otros',
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  alimentacion: 'bg-amber-100 text-amber-800',
  limpieza: 'bg-blue-100 text-blue-800',
  otros: 'bg-gray-100 text-gray-800',
}

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function TopServicesTable({ data, isLoading }: TopServicesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Servicios Más Contratados</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Servicios Más Contratados</h3>
        <div className="flex h-32 items-center justify-center rounded bg-gray-50">
          <span className="text-sm text-gray-400">Sin contrataciones de servicios</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Servicios Más Contratados</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 pr-4 font-medium text-gray-500">Servicio</th>
              <th className="pb-3 pr-4 font-medium text-gray-500">Clasificación</th>
              <th className="pb-3 pr-4 font-medium text-gray-500">Veces Contratado</th>
              <th className="pb-3 font-medium text-gray-500">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.serviceId} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{row.serviceName}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      CLASSIFICATION_COLORS[row.classification] ?? 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {CLASSIFICATION_LABELS[row.classification] ?? row.classification}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-600">{row.contractingCount}</td>
                <td className="py-3 font-medium text-gray-900">
                  {formatCurrency(row.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
