import type { ReportSummary } from '../../../types/report'

interface SummaryCardsProps {
  data: ReportSummary | null
  isLoading: boolean
}

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
            <div className="h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const activeReservations = (data.reservationsByStatus['confirmada'] ?? 0) +
    (data.reservationsByStatus['en_servicio'] ?? 0)
  const pendingLeads = data.leadsByStatus['nueva'] ?? 0

  const cards = [
    {
      title: 'Propiedades Activas',
      value: data.totalProperties,
      color: '#1e3a5f',
    },
    {
      title: 'Reservas Activas',
      value: activeReservations,
      color: '#059669',
    },
    {
      title: 'Leads Nuevos',
      value: pendingLeads,
      color: '#dc2626',
    },
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(data.revenueCurrentMonth),
      color: '#c9a84c',
    },
  ]

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-gray-500">{card.title}</p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color: card.color }}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
