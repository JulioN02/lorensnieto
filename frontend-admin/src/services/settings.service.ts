import { api } from './api'
import type { ApiResponse } from '../types'
import type { AdminSettings } from '../types/settings'

export async function getAdminSettings(): Promise<AdminSettings> {
  const { data } = await api.get<ApiResponse<AdminSettings>>('/admin/settings')
  if (!data.success || !data.data) throw new Error(data.error ?? 'Error al cargar configuración')
  return data.data
}

export async function updateAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
  const { data } = await api.put<ApiResponse<AdminSettings>>('/admin/settings', settings)
  if (!data.success || !data.data) throw new Error(data.error ?? 'Error al guardar configuración')
  return data.data
}
