export const PARTNER_PERIOD_STATUS = {
  PENDIENTE: 'pendiente',
  EN_ALERTA: 'en_alerta',
  PAGADO_PARCIAL: 'pagado_parcial',
  PAGADO: 'pagado',
  EN_DISPUTA: 'en_disputa',
} as const

export type PartnerPeriodStatus = (typeof PARTNER_PERIOD_STATUS)[keyof typeof PARTNER_PERIOD_STATUS]

export const PARTNER_PERIOD_STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  en_alerta: { label: 'En Alerta', color: 'bg-red-100 text-red-800' },
  pagado_parcial: { label: 'Pagado Parcial', color: 'bg-blue-100 text-blue-800' },
  pagado: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  en_disputa: { label: 'En Disputa', color: 'bg-purple-100 text-purple-800' },
} as const

export const PARTNER_PHASE = {
  FASE_1: 'fase_1',
  FASE_2: 'fase_2',
} as const

export type PartnerPhase = (typeof PARTNER_PHASE)[keyof typeof PARTNER_PHASE]

export interface PartnerSummary {
  period: PartnerPeriod | null
  settings: PartnerSettings | null
  ingresos: {
    arrendamientos: number
    servicios: number
    total: number
  }
  partnerAmount: number
  accumulated: {
    total: number
    target: number
    percent: number
  }
  activeAlerts: number
}

export interface PartnerPeriod {
  id: string
  month: string
  revenueTotal: number
  phase: string
  pctApplied: number
  amountDue: number
  amountPaid: number
  status: string
  deadlineDate: string
  paidAt: string | null
  disputeNotes: string | null
  createdAt: string
  updatedAt: string
  _count?: { alerts: number }
  alerts?: AlertLogItem[]
}

export interface AlertLogItem {
  id: string
  periodId: string
  amountPending: number
  triggeredAt: string
  resolvedAt: string | null
  period?: { month: string; amountDue: number; status: string }
}

export interface PartnerSettings {
  id: string
  commissionPct: number
  rulesDocUrl: string
  notificationEmail: string
  partnerDeadlineDays: number
}
