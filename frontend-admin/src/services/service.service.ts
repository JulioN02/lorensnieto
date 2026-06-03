import { api } from './api'
import type { ApiResponse, Service } from '../types'

export const serviceService = {
  async getServices(params?: { classification?: string; active?: boolean }): Promise<Service[]> {
    const queryParams: Record<string, string> = {}
    if (params?.classification) queryParams['classification'] = params.classification
    if (params?.active !== undefined) queryParams['active'] = String(params.active)

    const { data } = await api.get<ApiResponse<Service[]>>('/admin/services', {
      params: queryParams,
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar servicios')
    }
    return data.data
  },

  async getService(id: string): Promise<Service> {
    const { data } = await api.get<ApiResponse<Service>>(`/admin/services/${id}`)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar servicio')
    }
    return data.data
  },

  async createService(formData: FormData): Promise<Service> {
    const { data } = await api.post<ApiResponse<Service>>('/admin/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al crear servicio')
    }
    return data.data
  },

  async updateService(id: string, formData: FormData): Promise<Service> {
    const { data } = await api.put<ApiResponse<Service>>(`/admin/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al actualizar servicio')
    }
    return data.data
  },

  async deleteService(id: string): Promise<void> {
    const { data } = await api.delete<ApiResponse<void>>(`/admin/services/${id}`)
    if (!data.success) {
      throw new Error(data.error ?? 'Error al eliminar servicio')
    }
  },
}
