import type { OccupancyRow } from '../../../types/report'

interface OccupancyTableProps {
  data: OccupancyRow[]
  isLoading: boolean
}

const TYPE_LABELS: Record<string, string> = {
  casa_campo: 'Casa de Campo',
  apartamento: 'Apartamento',
}

export function OccupancyTable({ data, isLoading }: OccupancyTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Ocupación por Propiedad</h3>
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
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Ocupación por Propiedad</h3>
        <div className="flex h-32 items-center justify-center rounded bg-gray-50">
          <span className="text-sm text-gray-400">Sin datos de ocupación</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Ocupación por Propiedad</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 pr-4 font-medium text-gray-500">Propiedad</th>
              <th className="pb-3 pr-4 font-medium text-gray-500">Tipo</th>
              <th className="pb-3 pr-4 font-medium text-gray-500">Noches Disponibles</th>
              <th className="pb-3 pr-4 font-medium text-gray-500">Noches Reservadas</th>
              <th className="pb-3 font-medium text-gray-500">Ocupación</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.propertyId} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{row.propertyName}</td>
                <td className="py-3 pr-4 text-gray-600">
                  {TYPE_LABELS[row.propertyType] ?? row.propertyType}
                </td>
                <td className="py-3 pr-4 text-gray-600">{row.availableNights}</td>
                <td className="py-3 pr-4 text-gray-600">{row.bookedNights}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(row.occupancyPct, 100)}%`,
                          backgroundColor:
                            row.occupancyPct > 75
                              ? '#059669'
                              : row.occupancyPct > 40
                                ? '#c9a84c'
                                : '#dc2626',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {row.occupancyPct}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
