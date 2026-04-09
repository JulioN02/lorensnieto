// ============================================
// TIPOS COMPARTIDOS DEL SISTEMA
// ============================================

// -------------------- Roles --------------------
export type UserRole = 'admin' | 'partner';

// -------------------- Estados --------------------
export type LeadStatus = 'nueva' | 'revisada' | 'convertida' | 'descartada';

export type ReservationStatus =
  | 'pendiente'
  | 'confirmada'
  | 'en_servicio'
  | 'finalizada'
  | 'cancelada';

export type PaymentType = 'abono' | 'total';
export type PaymentStatus = 'pendiente' | 'pagado';

export type PropertyType = 'casa_campo' | 'apartamento';

export type ServiceClassification = 'alimentacion' | 'limpieza' | 'otros';

export type PartnerPhase = 'fase_1' | 'fase_2';

export type PartnerPeriodStatus =
  | 'pendiente'
  | 'en_alerta'
  | 'pagado_parcial'
  | 'pagado'
  | 'en_disputa';

export type MediaType = 'img' | 'video';
export type EntityType = 'property' | 'service';

// -------------------- Interfaces de Entidades --------------------

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  type: PropertyType;
  name: string;
  description: string;
  zone: string;
  address: string;
  capacity: number;
  rooms?: number;
  priceNight: number;
  amenities: string[];
  rules: string[];
  active: boolean;
  ownerName: string;
  ownerCedula: string;
  ownerPhone: string;
  ownerEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  classification: ServiceClassification;
  type: string;
  price: number;
  rules: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Media {
  id: string;
  entityType: EntityType;
  entityId: string;
  url: string;
  mediaType: MediaType;
  orderIndex: number;
  createdAt: Date;
}

export interface Lead {
  id: string;
  customerName: string;
  customerCedula: string;
  customerPhone: string;
  customerEmail: string;
  propertyId?: string;
  serviceId?: string;
  dateInterest?: Date;
  additionalServices?: string[];
  status: LeadStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerCedula: string;
  customerPhone: string;
  customerEmail: string;
  propertyId: string;
  dateStart: Date;
  dateEnd: Date;
  additionalServices: string[];
  priceTotal: number;
  status: ReservationStatus;
  observations: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contracting {
  id: string;
  customerName: string;
  customerCedula: string;
  customerPhone: string;
  customerEmail: string;
  serviceIds: string[];
  dateStart: Date;
  dateEnd: Date;
  priceTotal: number;
  status: ReservationStatus;
  observations: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerPeriod {
  id: string;
  month: string; // YYYY-MM
  revenueTotal: number;
  phase: PartnerPhase;
  pctApplied: number;
  amountDue: number;
  amountPaid: number;
  status: PartnerPeriodStatus;
  deadlineDate: Date;
  paidAt?: Date;
  disputeNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertLog {
  id: string;
  periodId: string;
  amountPending: number;
  triggeredAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface Settings {
  id: string;
  commissionPct: number;
  rulesDocUrl: string;
  notificationEmail: string;
  partnerDeadlineDays: number;
  createdAt: Date;
  updatedAt: Date;
}

// -------------------- Tipos de Request/Response --------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// -------------------- Express Extensions --------------------
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: UserRole;
  }
}
