import { api } from './api'
import type { ApiResponse } from '../types'
import type { ReportSummary, RevenueByType, TopProperty, OccupancyRow, TopService } from '../types/report'

function buildParams(startDate?: string, endDate?: string): Record<string, string> {
  const params: Record<string, string> = {}
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  return params
}

export async function getReportsOverview(startDate?: string, endDate?: string): Promise<ReportSummary> {
  const params = buildParams(startDate, endDate)
  const { data } = await api.get<ApiResponse<ReportSummary>>('/admin/reports/overview', { params })
  if (!data.success || !data.data) throw new Error(data.error ?? 'Error al cargar resumen')
  return data.data
}

export async function getRevenueByType(startDate?: string, endDate?: string): Promise<RevenueByType[]> {
  const params = buildParams(startDate, endDate)
  const { data } = await api.get<ApiResponse<RevenueByType[]>>('/admin/reports/by-type', { params })
  if (!data.success || !data.data) throw new Error(data.error ?? 'Error al cargar ingresos por tipo')
  return data.data
}

export async function getTopProperties(startDate?: string, endDate?: string): Promise<TopProperty[]> {
  const params = buildParams(startDate, endDate)
  const { data } = await api.get<ApiResponse<TopProperty[]>>('/admin/reports/by-property', { params })
  if (!data.success || !data.data) throw new Error(data.error ?? 'Error al cargar propiedades top')
  return data.data
}

export async function getOccupancy(startDate?: string, endDate?: string): Promise<OccupancyRow[]> {
  const params = buildParams(startDate, endDate)
  const { data } = await api.get<ApiResponse<OccupancyRow[]>>('/admin/reports/occupancy', { params })
  if (!data.success || !data.data) throw new Error(data.error ?? 'Error al cargar ocupación')
  return data.data
}

export async function getTopServices(startDate?: string, endDate?: string): Promise<TopService[]> {
  const params = buildParams(startDate, endDate)
  const { data } = await api.get<ApiResponse<TopService[]>>('/admin/reports/by-service', { params })
  if (!data.success || !data.data) throw new Error(data.error ?? 'Error al cargar servicios top')
  return data.data
}
