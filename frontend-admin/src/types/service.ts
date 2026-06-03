import type { PropertyMedia } from './shared'

export const SERVICE_CLASSIFICATIONS = {
  ALIMENTACION: 'alimentacion',
  LIMPIEZA: 'limpieza',
  OTROS: 'otros',
} as const

export type ServiceClassification = (typeof SERVICE_CLASSIFICATIONS)[keyof typeof SERVICE_CLASSIFICATIONS]

export const SERVICE_CLASSIFICATION_LABELS: Record<ServiceClassification, string> = {
  [SERVICE_CLASSIFICATIONS.ALIMENTACION]: 'Alimentación',
  [SERVICE_CLASSIFICATIONS.LIMPIEZA]: 'Limpieza',
  [SERVICE_CLASSIFICATIONS.OTROS]: 'Otros',
}

export interface Service {
  id: string
  name: string
  description: string
  classification: ServiceClassification
  type: string
  price: number
  rules: string[]
  active: boolean
  media: PropertyMedia[]
  createdAt: string
  updatedAt: string
}

export interface ServiceFormData {
  name: string
  description: string
  classification: ServiceClassification
  type: string
  price: number
  rules: string[]
  active: boolean
  media: FileList | null
}
