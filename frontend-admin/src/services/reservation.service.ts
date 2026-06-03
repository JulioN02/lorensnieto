import { api } from './api'
import type { ApiResponse, Reservation, AvailabilityResult, PriceCalculation, ReservationCreatePayload, ReservationUpdatePayload } from '../types'

export const reservationService = {
  async getReservations(params?: { status?: string; propertyId?: string }): Promise<Reservation[]> {
    const queryParams: Record<string, string> = {}
    if (params?.status) queryParams['status'] = params.status
    if (params?.propertyId) queryParams['propertyId'] = params.propertyId

    const { data } = await api.get<ApiResponse<Reservation[]>>('/admin/reservations', {
      params: queryParams,
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar reservas')
    }
    return data.data
  },

  async getReservation(id: string): Promise<Reservation> {
    const { data } = await api.get<ApiResponse<Reservation>>(`/admin/reservations/${id}`)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar reserva')
    }
    return data.data
  },

  async getReservationsByProperty(propertyId: string): Promise<Reservation[]> {
    const { data } = await api.get<ApiResponse<Reservation[]>>(`/admin/reservations/property/${propertyId}`)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar reservas de la propiedad')
    }
    return data.data
  },

  async checkAvailability(propertyId: string, dateStart: string, dateEnd: string): Promise<AvailabilityResult> {
    const { data } = await api.post<ApiResponse<AvailabilityResult>>('/admin/reservations/check-availability', {
      propertyId,
      dateStart,
      dateEnd,
    })
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al verificar disponibilidad')
    }
    return data.data
  },

  async calculatePrice(payload: ReservationCreatePayload): Promise<PriceCalculation> {
    const { data } = await api.post<ApiResponse<PriceCalculation>>('/admin/reservations/calculate-price', payload)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al calcular precio')
    }
    return data.data
  },

  async createReservation(payload: ReservationCreatePayload): Promise<Reservation> {
    const { data } = await api.post<ApiResponse<Reservation>>('/admin/reservations', payload)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al crear reserva')
    }
    return data.data
  },

  async updateReservation(id: string, payload: Partial<ReservationUpdatePayload>): Promise<Reservation> {
    const { data } = await api.put<ApiResponse<Reservation>>(`/admin/reservations/${id}`, payload)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al actualizar reserva')
    }
    return data.data
  },

  async cancelReservation(id: string): Promise<void> {
    const { data } = await api.put<ApiResponse<void>>(`/admin/reservations/${id}/cancel`)
    if (!data.success) {
      throw new Error(data.error ?? 'Error al cancelar reserva')
    }
  },

  async deleteReservation(id: string): Promise<void> {
    const { data } = await api.delete<ApiResponse<void>>(`/admin/reservations/${id}`)
    if (!data.success) {
      throw new Error(data.error ?? 'Error al eliminar reserva')
    }
  },
}
