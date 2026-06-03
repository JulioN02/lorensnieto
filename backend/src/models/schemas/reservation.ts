import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN — RESERVAS
// ============================================

// Enum de status - memoized para no recrear en cada validación
const reservationStatuses = ['pendiente', 'confirmada', 'en_servicio', 'finalizada', 'cancelada'] as const;

// Schema para crear una nueva reserva
export const reservationCreateSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  customerName: z.string().min(2, 'Nombre del cliente requerido').max(200),
  customerCedula: z.string().min(5, 'Cédula del cliente requerida').max(50),
  customerPhone: z.string().min(7, 'Teléfono del cliente requerido').max(50),
  customerEmail: z.string().email('Email del cliente inválido'),
  dateStart: z.string().datetime({ message: 'Fecha de inicio inválida' }),
  dateEnd: z.string().datetime({ message: 'Fecha de fin inválida' }),
  additionalServices: z.array(z.string()).default([]),
  observations: z.string().default(''),
});

// Schema para actualizar una reserva (solo ciertos campos pueden cambiar)
export const reservationUpdateSchema = z.object({
  status: z.enum(reservationStatuses).optional(),
  observations: z.string().optional(),
  dateStart: z.string().datetime().optional(),
  dateEnd: z.string().datetime().optional(),
  additionalServices: z.array(z.string()).optional(),
});

// Schema para validar disponibilidad de fechas
export const availabilityCheckSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  dateStart: z.string().datetime({ message: 'Fecha de inicio inválida' }),
  dateEnd: z.string().datetime({ message: 'Fecha de fin inválida' }),
});

// Schema para crear reserva desde un Lead existente
export const reservationFromLeadSchema = z.object({
  leadId: z.string().uuid('ID de lead inválido'),
  propertyId: z.string().uuid('ID de propiedad inválido'),
  dateStart: z.string().datetime({ message: 'Fecha de inicio inválida' }),
  dateEnd: z.string().datetime({ message: 'Fecha de fin inválida' }),
  additionalServices: z.array(z.string()).default([]),
  observations: z.string().default(''),
});

// ============================================
// TIPOS EXPORTADOS
// ============================================

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
export type ReservationFromLeadInput = z.infer<typeof reservationFromLeadSchema>;