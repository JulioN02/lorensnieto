import { api } from './api'
import type { ApiResponse, User, LoginCredentials } from '../types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>('/auth/login', credentials)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al iniciar sesión')
    }
    return data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al obtener usuario')
    }
    return data.data
  },
}
