export interface ReportSummary {
  totalProperties: number
  totalServices: number
  reservationsByStatus: Record<string, number>
  leadsByStatus: Record<string, number>
  revenueCurrentMonth: number
}

export interface RevenueByType {
  type: string
  revenue: number
  reservationCount: number
}

export interface TopProperty {
  propertyId: string
  propertyName: string
  type: string
  reservationCount: number
  revenue: number
}

export interface OccupancyRow {
  propertyId: string
  propertyName: string
  propertyType: string
  availableNights: number
  bookedNights: number
  occupancyPct: number
}

export interface TopService {
  serviceId: string
  serviceName: string
  classification: string
  contractingCount: number
  revenue: number
}
