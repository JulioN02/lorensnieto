import { useState } from 'react'

interface DateFilterProps {
  onApply: (startDate: string, endDate: string) => void
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getMonthStart(): string {
  const d = new Date()
  return formatDate(new Date(d.getFullYear(), d.getMonth(), 1))
}

function getMonthEnd(): string {
  const d = new Date()
  return formatDate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

function getToday(): string {
  return formatDate(new Date())
}

function getWeekAgo(): string {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return formatDate(d)
}

export function DateFilter({ onApply }: DateFilterProps) {
  const [startDate, setStartDate] = useState(getMonthStart())
  const [endDate, setEndDate] = useState(getMonthEnd())

  const handleQuickSelect = (period: 'day' | 'week' | 'month') => {
    let s: string, e: string
    switch (period) {
      case 'day':
        s = getToday()
        e = getToday()
        break
      case 'week':
        s = getWeekAgo()
        e = getToday()
        break
      case 'month':
      default:
        s = getMonthStart()
        e = getMonthEnd()
        break
    }
    setStartDate(s)
    setEndDate(e)
    onApply(s, e)
  }

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate)
    }
  }

  return (
    <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleQuickSelect('day')}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Día
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('week')}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect('month')}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Mes
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
