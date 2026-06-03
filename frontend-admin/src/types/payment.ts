export const PAYMENT_TYPES = { ABONO: 'abono', TOTAL: 'total' } as const
export const PAYMENT_STATUS = { PENDIENTE: 'pendiente', PAGADO: 'pagado' } as const

export type PaymentType = (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES]
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export interface Payment {
  id: string
  reservationId: string
  amount: number
  type: 'abono' | 'total'
  status: 'pendiente' | 'pagado'
  createdAt: string
  updatedAt: string
}

export interface PaymentCreatePayload {
  amount: number
  type: 'abono' | 'total'
  status?: 'pendiente' | 'pagado'
}
