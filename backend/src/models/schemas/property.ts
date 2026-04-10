import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN — PROPIEDADES
// ============================================

export const propertyCreateSchema = z.object({
  type: z.enum(['casa_campo', 'apartamento'], {
    errorMap: () => ({ message: 'Tipo inválido. Debe ser: casa_campo o apartamento' }),
  }),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(200),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres').max(5000),
  zone: z.string().min(2, 'Zona requerida').max(200),
  address: z.string().min(5, 'Dirección requerida').max(300),
  capacity: z.number().int().positive('Capacidad debe ser mayor a 0'),
  rooms: z.number().int().min(0).optional(),
  priceNight: z.number().positive('Precio por noche debe ser mayor a 0'),
  amenities: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  ownerName: z.string().min(2, 'Nombre del propietario requerido').max(200),
  ownerCedula: z.string().min(5, 'Cédula del propietario requerida').max(50),
  ownerPhone: z.string().min(7, 'Teléfono del propietario requerido').max(50),
  ownerEmail: z.string().email('Email del propietario inválido'),
});

export const propertyUpdateSchema = z.object({
  type: z.enum(['casa_campo', 'apartamento']).optional(),
  name: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  zone: z.string().min(2).max(200).optional(),
  address: z.string().min(5).max(300).optional(),
  capacity: z.number().int().positive().optional(),
  rooms: z.number().int().min(0).optional(),
  priceNight: z.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  ownerName: z.string().min(2).max(200).optional(),
  ownerCedula: z.string().min(5).max(50).optional(),
  ownerPhone: z.string().min(7).max(50).optional(),
  ownerEmail: z.string().email().optional(),
});

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;