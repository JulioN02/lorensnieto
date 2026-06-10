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
import type { TopProperty } from '../../../types/report'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface TopPropertiesChartProps {
  data: TopProperty[]
  isLoading: boolean
}

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function TopPropertiesChart({ data, isLoading }: TopPropertiesChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Propiedades con Mayor Ingreso</h3>
        <div className="flex h-64 animate-pulse items-center justify-center rounded bg-gray-100">
          <span className="text-sm text-gray-400">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Propiedades con Mayor Ingreso</h3>
        <div className="flex h-64 items-center justify-center rounded bg-gray-50">
          <span className="text-sm text-gray-400">Sin datos en este período</span>
        </div>
      </div>
    )
  }

  const labels = data.map((d) => d.propertyName)
  const revenues = data.map((d) => d.revenue)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: revenues,
        backgroundColor: '#1e3a5f',
        borderRadius: 6,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
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
      x: {
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
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Propiedades con Mayor Ingreso
        {data.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Top {data.length})
          </span>
        )}
      </h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export { formatCurrency }
