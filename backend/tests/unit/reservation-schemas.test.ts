import { describe, it, expect } from '@jest/globals';
import {
  reservationCreateSchema,
  reservationUpdateSchema,
  availabilityCheckSchema,
} from '../../src/models/schemas/reservation';

// ============================================
// TESTS UNITARIOS — RESERVATION SCHEMAS
// ============================================

describe('Reservation Schemas', () => {
  const validReservation = {
    propertyId: '123e4567-e89b-12d3-a456-426614174000',
    customerName: 'Juan Pérez',
    customerCedula: '1234567890',
    customerPhone: '3001234567',
    customerEmail: 'juan@test.com',
    dateStart: '2024-06-15T14:00:00.000Z',
    dateEnd: '2024-06-18T12:00:00.000Z',
    additionalServices: [],
    observations: 'Llegada temprano',
  };

  describe('reservationCreateSchema', () => {
    it('should validate a correct reservation', () => {
      const result = reservationCreateSchema.safeParse(validReservation);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const { customerName, ...incomplete } = validReservation;
      const result = reservationCreateSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject invalid propertyId format', () => {
      const result = reservationCreateSchema.safeParse({
        ...validReservation,
        propertyId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty customerName', () => {
      const result = reservationCreateSchema.safeParse({
        ...validReservation,
        customerName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid customerEmail', () => {
      const result = reservationCreateSchema.safeParse({
        ...validReservation,
        customerEmail: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = reservationCreateSchema.safeParse({
        ...validReservation,
        dateStart: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short customerCedula', () => {
      const result = reservationCreateSchema.safeParse({
        ...validReservation,
        customerCedula: 'ABC',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid additionalServices array', () => {
      const result = reservationCreateSchema.safeParse({
        ...validReservation,
        additionalServices: ['limpieza', 'desayuno'],
      });
      expect(result.success).toBe(true);
    });

    it('should default additionalServices to empty array', () => {
      const { additionalServices, ...withoutServices } = validReservation;
      const result = reservationCreateSchema.safeParse(withoutServices);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.additionalServices).toEqual([]);
      }
    });
  });

  describe('reservationUpdateSchema', () => {
    it('should validate status update', () => {
      const result = reservationUpdateSchema.safeParse({ status: 'confirmada' });
      expect(result.success).toBe(true);
    });

    it('should validate observations update', () => {
      const result = reservationUpdateSchema.safeParse({
        observations: 'Cliente llegó antes',
      });
      expect(result.success).toBe(true);
    });

    it('should validate date update', () => {
      const result = reservationUpdateSchema.safeParse({
        dateStart: '2024-07-01T14:00:00.000Z',
        dateEnd: '2024-07-05T12:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('should validate empty object', () => {
      const result = reservationUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = reservationUpdateSchema.safeParse({ status: 'invalido' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid status in array', () => {
      const result = reservationUpdateSchema.safeParse({
        status: 'aprobada',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('availabilityCheckSchema', () => {
    const validAvailability = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      dateStart: '2024-06-15T14:00:00.000Z',
      dateEnd: '2024-06-18T12:00:00.000Z',
    };

    it('should validate correct availability check', () => {
      const result = availabilityCheckSchema.safeParse(validAvailability);
      expect(result.success).toBe(true);
    });

    it('should reject missing propertyId', () => {
      const { propertyId, ...incomplete } = validAvailability;
      const result = availabilityCheckSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject invalid propertyId', () => {
      const result = availabilityCheckSchema.safeParse({
        ...validAvailability,
        propertyId: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});