import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN — SERVICIOS
// ============================================

export const serviceCreateSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(200),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres').max(5000),
  classification: z.enum(['alimentacion', 'limpieza', 'otros'], {
    errorMap: () => ({ message: 'Clasificación inválida. Debe ser: alimentacion, limpieza u otros' }),
  }),
  type: z.string().min(2, 'Tipo requerido').max(100),
  price: z.number().positive('Precio debe ser mayor a 0'),
  rules: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export const serviceUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  classification: z.enum(['alimentacion', 'limpieza', 'otros']).optional(),
  type: z.string().min(2).max(100).optional(),
  price: z.number().positive().optional(),
  rules: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;