export const RESERVATION_STATUS = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  EN_SERVICIO: 'en_servicio',
  FINALIZADA: 'finalizada',
  CANCELADA: 'cancelada',
} as const

export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS]

export const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', dot: '🟡' },
  confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-800', dot: '🟢' },
  en_servicio: { label: 'En Servicio', color: 'bg-blue-100 text-blue-800', dot: '🔵' },
  finalizada: { label: 'Finalizada', color: 'bg-gray-100 text-gray-800', dot: '⚪' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800', dot: '🔴' },
} as const

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['en_servicio', 'cancelada'],
  en_servicio: ['finalizada'],
  finalizada: [],
  cancelada: [],
}

export const STATUS_ACTIONS: Record<string, { nextStatus: string; label: string; color: string }[]> = {
  pendiente: [
    { nextStatus: RESERVATION_STATUS.CONFIRMADA, label: 'Confirmar Reserva', color: 'bg-green-600 hover:bg-green-700' },
    { nextStatus: RESERVATION_STATUS.CANCELADA, label: 'Cancelar Reserva', color: 'bg-red-600 hover:bg-red-700' },
  ],
  confirmada: [
    { nextStatus: RESERVATION_STATUS.EN_SERVICIO, label: 'Marcar en Servicio', color: 'bg-blue-600 hover:bg-blue-700' },
    { nextStatus: RESERVATION_STATUS.CANCELADA, label: 'Cancelar Reserva', color: 'bg-red-600 hover:bg-red-700' },
  ],
  en_servicio: [
    { nextStatus: RESERVATION_STATUS.FINALIZADA, label: 'Finalizar', color: 'bg-gray-600 hover:bg-gray-700' },
  ],
  finalizada: [],
  cancelada: [],
}

export interface Payment {
  id: string
  reservationId: string
  amount: number
  type: 'abono' | 'total'
  status: 'pendiente' | 'pagado'
  createdAt: string
  updatedAt: string
}

export interface Reservation {
  id: string
  customerName: string
  customerCedula: string
  customerPhone: string
  customerEmail: string
  dateStart: string
  dateEnd: string
  additionalServices: string[]
  priceTotal: number
  status: ReservationStatus
  observations: string
  propertyId: string
  property: {
    id: string
    name: string
    type: string
    priceNight?: number
  }
  payments?: Payment[]
  _count?: { payments: number }
  leadId?: string | null
  createdAt: string
  updatedAt: string
}

export interface AvailabilityResult {
  available: boolean
  propertyId: string
  dateStart: string
  dateEnd: string
  conflicts: number
}

export interface PriceCalculation {
  nights: number
  priceNight: number
  basePrice: number
  servicesPrice: number
  priceTotal: number
}

export interface ReservationCreatePayload {
  propertyId: string
  customerName: string
  customerCedula: string
  customerPhone: string
  customerEmail: string
  dateStart: string
  dateEnd: string
  additionalServices: string[]
  observations: string
}

export interface ReservationUpdatePayload {
  status?: ReservationStatus
  observations?: string
  dateStart?: string
  dateEnd?: string
  additionalServices?: string[]
}
