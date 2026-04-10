import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN — MEDIA (imágenes/videos)
// ============================================

export const mediaCreateSchema = z.object({
  entityType: z.enum(['property', 'service'], {
    errorMap: () => ({ message: 'entityType inválido. Debe ser: property o service' }),
  }),
  entityId: z.string().uuid('ID de entidad inválido'),
  url: z.string().url('URL inválida'),
  mediaType: z.enum(['img', 'video'], {
    errorMap: () => ({ message: 'mediaType inválido. Debe ser: img o video' }),
  }),
  orderIndex: z.number().int().min(0).default(0),
});

export const mediaUpdateSchema = z.object({
  url: z.string().url().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;