import { z } from 'zod';

export const partnerPeriodUpdateSchema = z.object({
  amountPaid: z.number().positive('El monto debe ser mayor a 0').optional(),
  status: z.string().optional(),
  disputeNotes: z.string().optional(),
});

export const partnerSettingsUpdateSchema = z.object({
  partnerDeadlineDays: z.number().int().min(1).max(30).optional(),
  commissionPct: z.number().min(0).max(1).optional(),
  notificationEmail: z.string().email().optional(),
  rulesDocUrl: z.string().optional(),
});

export type PartnerPeriodUpdateInput = z.infer<typeof partnerPeriodUpdateSchema>;
export type PartnerSettingsUpdateInput = z.infer<typeof partnerSettingsUpdateSchema>;
