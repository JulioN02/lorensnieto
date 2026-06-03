import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN — PAGOS
// ============================================

const paymentTypes = ['abono', 'total'] as const;
const paymentStatuses = ['pendiente', 'pagado'] as const;

// Schema para crear un nuevo pago
export const paymentCreateSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a 0'),
  type: z.enum(paymentTypes, {
    errorMap: () => ({ message: 'Tipo debe ser abono o total' }),
  }),
  status: z.enum(paymentStatuses).default('pendiente'),
});

// ============================================
// TIPOS EXPORTADOS
// ============================================

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
