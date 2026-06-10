// ============================================
// SCHEMAS DE VALIDACIÓN — PDF Route Params
// ============================================

import { z } from 'zod';

export const pdfReservationParamsSchema = z.object({
  reservationId: z.string().uuid('ID de reserva inválido'),
});

export const pdfPeriodParamsSchema = z.object({
  periodId: z.string().uuid('ID de período inválido'),
});
