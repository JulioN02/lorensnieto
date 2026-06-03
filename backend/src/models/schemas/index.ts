export { propertyCreateSchema, propertyUpdateSchema } from './property.js';
export type { PropertyCreateInput, PropertyUpdateInput } from './property.js';

export { serviceCreateSchema, serviceUpdateSchema } from './service.js';
export type { ServiceCreateInput, ServiceUpdateInput } from './service.js';

export { mediaCreateSchema, mediaUpdateSchema } from './media.js';
export type { MediaCreateInput, MediaUpdateInput } from './media.js';

export {
  reservationCreateSchema,
  reservationUpdateSchema,
  availabilityCheckSchema,
  reservationFromLeadSchema,
} from './reservation.js';
export type {
  ReservationCreateInput,
  ReservationUpdateInput,
  AvailabilityCheckInput,
  ReservationFromLeadInput,
} from './reservation.js';

export { leadStatusUpdateSchema, leadNoteSchema, leadConvertSchema } from './lead.js';
export type { LeadStatusUpdateInput, LeadNoteInput, LeadConvertInput } from './lead.js';

export { paymentCreateSchema } from './payment.js';
export type { PaymentCreateInput } from './payment.js';

export { partnerPeriodUpdateSchema, partnerSettingsUpdateSchema } from './partner.js';
export type { PartnerPeriodUpdateInput, PartnerSettingsUpdateInput } from './partner.js';