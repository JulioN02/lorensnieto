import { api } from './api'
import type { ApiResponse, Property } from '../types'

export const propertyService = {
  async getProperties(params?: { type?: string; active?: boolean }): Promise<Property[]> {
    const queryParams: Record<string, string> = {}
    if (params?.type) queryParams['type'] = params.type
    if (params?.active !== undefined) queryParams['active'] = String(params.active)

    const { data } = await api.get<ApiResponse<Property[]>>('/admin/properties', {
      params: queryParams,
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar propiedades')
    }
    return data.data
  },

  async getProperty(id: string): Promise<Property> {
    const { data } = await api.get<ApiResponse<Property>>(`/admin/properties/${id}`)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar propiedad')
    }
    return data.data
  },

  async createProperty(formData: FormData): Promise<Property> {
    const { data } = await api.post<ApiResponse<Property>>('/admin/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al crear propiedad')
    }
    return data.data
  },

  async updateProperty(id: string, formData: FormData): Promise<Property> {
    const { data } = await api.put<ApiResponse<Property>>(`/admin/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al actualizar propiedad')
    }
    return data.data
  },

  async deleteProperty(id: string): Promise<void> {
    const { data } = await api.delete<ApiResponse<void>>(`/admin/properties/${id}`)
    if (!data.success) {
      throw new Error(data.error ?? 'Error al eliminar propiedad')
    }
  },
}
