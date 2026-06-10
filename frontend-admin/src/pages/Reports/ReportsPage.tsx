import { useState, useEffect, useCallback } from 'react'
import {
  getReportsOverview,
  getRevenueByType,
  getTopProperties,
  getOccupancy,
  getTopServices,
} from '../../services'
import type { ReportSummary, RevenueByType, TopProperty, OccupancyRow, TopService } from '../../types'
import { DateFilter } from './components/DateFilter'
import { SummaryCards } from './components/SummaryCards'
import { RevenueChart } from './components/RevenueChart'
import { TopPropertiesChart } from './components/TopPropertiesChart'
import { OccupancyTable } from './components/OccupancyTable'
import { TopServicesTable } from './components/TopServicesTable'

interface ReportsData {
  overview: ReportSummary | null
  revenueByType: RevenueByType[]
  topProperties: TopProperty[]
  occupancy: OccupancyRow[]
  topServices: TopService[]
}

function getInitialDates(): { startDate: string; endDate: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export function ReportsPage() {
  const initialDates = getInitialDates()
  const [startDate, setStartDate] = useState(initialDates.startDate)
  const [endDate, setEndDate] = useState(initialDates.endDate)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ReportsData>({
    overview: null,
    revenueByType: [],
    topProperties: [],
    occupancy: [],
    topServices: [],
  })

  const fetchReports = useCallback(async (sDate: string, eDate: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const [overview, revenueByType, topProperties, occupancy, topServices] =
        await Promise.all([
          getReportsOverview(sDate, eDate),
          getRevenueByType(sDate, eDate),
          getTopProperties(sDate, eDate),
          getOccupancy(sDate, eDate),
          getTopServices(sDate, eDate),
        ])

      setData({ overview, revenueByType, topProperties, occupancy, topServices })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar reportes'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports(startDate, endDate)
  }, [])

  const handleDateChange = (sDate: string, eDate: string) => {
    setStartDate(sDate)
    setEndDate(eDate)
    fetchReports(sDate, eDate)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
      </div>

      <DateFilter onApply={handleDateChange} />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => fetchReports(startDate, endDate)}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <SummaryCards data={data.overview} isLoading={isLoading} />

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <RevenueChart data={data.revenueByType} isLoading={isLoading} />
        <TopPropertiesChart data={data.topProperties} isLoading={isLoading} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <OccupancyTable data={data.occupancy} isLoading={isLoading} />
        <TopServicesTable data={data.topServices} isLoading={isLoading} />
      </div>
    </div>
  )
}
