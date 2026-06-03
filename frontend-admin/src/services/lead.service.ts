import { api } from './api'
import type { ApiResponse, Lead } from '../types'

export const leadService = {
  async getLeads(params?: { status?: string }): Promise<{ data: Lead[]; unreadCount: number }> {
    const queryParams: Record<string, string> = {}
    if (params?.status) queryParams['status'] = params.status

    const { data } = await api.get<ApiResponse<Lead[]> & { unreadCount: number }>('/admin/leads', {
      params: queryParams,
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar solicitudes')
    }
    return { data: data.data, unreadCount: data.unreadCount ?? 0 }
  },

  async getLead(id: string): Promise<Lead> {
    const { data } = await api.get<ApiResponse<Lead>>(`/admin/leads/${id}`)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar solicitud')
    }
    return data.data
  },

  async updateLeadStatus(id: string, status: string, notes?: string): Promise<Lead> {
    const { data } = await api.patch<ApiResponse<Lead>>(`/admin/leads/${id}/status`, { status, notes })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al actualizar estado')
    }
    return data.data
  },

  async addLeadNote(id: string, content: string): Promise<void> {
    const { data } = await api.post<ApiResponse<void>>(`/admin/leads/${id}/notes`, { content })
    if (!data.success) {
      throw new Error(data.error ?? 'Error al agregar nota')
    }
  },

  async convertLeadToReservation(id: string, payload: {
    propertyId: string
    customerName: string
    customerCedula: string
    customerPhone: string
    customerEmail: string
    dateStart: string
    dateEnd: string
    additionalServices: string[]
    observations: string
  }): Promise<any> {
    const { data } = await api.post<ApiResponse<any>>(`/admin/leads/${id}/convert`, payload)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al convertir solicitud')
    }
    return data.data
  },
}
