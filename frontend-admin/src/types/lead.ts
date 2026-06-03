export const LEAD_STATUS = {
  NUEVA: 'nueva',
  REVISADA: 'revisada',
  CONVERTIDA: 'convertida',
  DESCARTADA: 'descartada',
} as const

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS]

export const LEAD_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  nueva: { label: 'Nueva', color: 'bg-blue-100 text-blue-800' },
  revisada: { label: 'Revisada', color: 'bg-yellow-100 text-yellow-800' },
  convertida: { label: 'Convertida', color: 'bg-green-100 text-green-800' },
  descartada: { label: 'Descartada', color: 'bg-gray-100 text-gray-800' },
}

export interface LeadNote {
  id: string
  leadId: string
  content: string
  createdAt: string
}

export interface Lead {
  id: string
  customerName: string
  customerCedula: string
  customerPhone: string
  customerEmail: string
  dateInterest: string | null
  additionalServices: string[]
  status: string
  notes: string
  propertyId: string | null
  property: { id: string; name: string; type: string } | null
  serviceId: string | null
  service: { id: string; name: string; classification: string } | null
  leadNotes: LeadNote[]
  reservation: any | null
  createdAt: string
  updatedAt: string
}
