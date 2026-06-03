import { api } from './api'
import type { ApiResponse } from '../types'

export interface DashboardSummary {
  totalProperties: number
  totalServices: number
  pendingLeads: number
  totalReservations: number
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<ApiResponse<DashboardSummary>>('/admin/dashboard')
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar dashboard')
    }
    return data.data
  },
}
