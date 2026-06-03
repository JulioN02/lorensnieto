import { api } from './api'
import type { ApiResponse, Payment, PaymentCreatePayload } from '../types'

export const paymentService = {
  async getPayments(reservationId: string): Promise<Payment[]> {
    const { data } = await api.get<ApiResponse<Payment[]>>(`/admin/reservations/${reservationId}/payments`)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al cargar pagos')
    }
    return data.data
  },

  async createPayment(reservationId: string, payload: PaymentCreatePayload): Promise<Payment> {
    const { data } = await api.post<ApiResponse<Payment>>(`/admin/reservations/${reservationId}/payments`, payload)
    if (!data.success || !data.data) {
      throw new Error(data.error ?? 'Error al registrar pago')
    }
    return data.data
  },
}
