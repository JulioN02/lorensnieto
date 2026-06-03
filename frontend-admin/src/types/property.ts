import type { PropertyMedia } from './shared'

export const PROPERTY_TYPES = {
  CASA_CAMPO: 'casa_campo',
  APARTAMENTO: 'apartamento',
} as const

export type PropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES]

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PROPERTY_TYPES.CASA_CAMPO]: 'Casa de Campo',
  [PROPERTY_TYPES.APARTAMENTO]: 'Apartamento',
}

export interface Property {
  id: string
  type: PropertyType
  name: string
  description: string
  zone: string
  address: string
  capacity: number
  rooms: number | null
  priceNight: number
  amenities: string[]
  rules: string[]
  active: boolean
  ownerName: string
  ownerCedula: string
  ownerPhone: string
  ownerEmail: string
  media: PropertyMedia[]
  _count?: { reservations: number }
  createdAt: string
  updatedAt: string
}

export interface PropertyFormData {
  type: PropertyType
  name: string
  description: string
  zone: string
  address: string
  capacity: number
  rooms: string
  priceNight: number
  amenities: string[]
  rules: string[]
  active: boolean
  ownerName: string
  ownerCedula: string
  ownerPhone: string
  ownerEmail: string
  media: FileList | null
}
