import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN — LEADS (Solicitudes)
// ============================================

const leadStatuses = ['nueva', 'revisada', 'convertida', 'descartada'] as const;

// Schema para actualizar el estado de un lead
export const leadStatusUpdateSchema = z.object({
  status: z.enum(leadStatuses),
  notes: z.string().optional(),
});

// Schema para agregar una nota interna
export const leadNoteSchema = z.object({
  content: z.string().min(1, 'La nota no puede estar vacía').max(2000),
});

// Schema para convertir un lead en reserva
export const leadConvertSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido').optional(),
  serviceId: z.string().uuid('ID de servicio inválido').optional(),
  dateStart: z.string().datetime({ message: 'Fecha de inicio inválida' }),
  dateEnd: z.string().datetime({ message: 'Fecha de fin inválida' }),
  additionalServices: z.array(z.string()).default([]),
  observations: z.string().default(''),
});

// ============================================
// TIPOS EXPORTADOS
// ============================================

export type LeadStatusUpdateInput = z.infer<typeof leadStatusUpdateSchema>;
export type LeadNoteInput = z.infer<typeof leadNoteSchema>;
export type LeadConvertInput = z.infer<typeof leadConvertSchema>;
