import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { RevenueByType } from '../../../types/report'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RevenueChartProps {
  data: RevenueByType[]
  isLoading: boolean
}

const TYPE_LABELS: Record<string, string> = {
  casa_campo: 'Casas de Campo',
  apartamento: 'Apartamentos',
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Ingresos por Tipo de Propiedad</h3>
        <div className="flex h-64 animate-pulse items-center justify-center rounded bg-gray-100">
          <span className="text-sm text-gray-400">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Ingresos por Tipo de Propiedad</h3>
        <div className="flex h-64 items-center justify-center rounded bg-gray-50">
          <span className="text-sm text-gray-400">Sin datos disponibles</span>
        </div>
      </div>
    )
  }

  const labels = data.map((d) => TYPE_LABELS[d.type] ?? d.type)
  const revenues = data.map((d) => d.revenue)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: revenues,
        backgroundColor: ['#1e3a5f', '#c9a84c'],
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            '$' + Number(context.raw).toLocaleString('es-CO'),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) =>
            '$' + Number(value).toLocaleString('es-CO'),
        },
      },
    },
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Ingresos por Tipo de Propiedad</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
