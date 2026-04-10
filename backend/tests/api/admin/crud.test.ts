import { describe, it, expect } from '@jest/globals';
import { propertyCreateSchema, propertyUpdateSchema } from '../../../src/models/schemas/property';
import { serviceCreateSchema, serviceUpdateSchema } from '../../../src/models/schemas/service';

// ============================================
// TESTS UNITARIOS — SCHEMAS DE VALIDACIÓN
// ============================================

describe('Property Schemas', () => {
  const validProperty = {
    type: 'casa_campo' as const,
    name: 'Casa El Paraíso',
    description: 'Hermosa casa de campo con vista a las montañas',
    zone: 'Valledupar Centro',
    address: 'Calle 10 #5-20',
    capacity: 6,
    rooms: 3,
    priceNight: 250000,
    amenities: ['WiFi', 'Piscina'],
    rules: ['No fumar'],
    active: true,
    ownerName: 'Carlos Pérez',
    ownerCedula: '1234567890',
    ownerPhone: '3001234567',
    ownerEmail: 'carlos@test.com',
  };

  describe('propertyCreateSchema', () => {
    it('should validate a correct property', () => {
      const result = propertyCreateSchema.safeParse(validProperty);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const { name, ...incomplete } = validProperty;
      const result = propertyCreateSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const result = propertyCreateSchema.safeParse({
        ...validProperty,
        type: 'hotel',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = propertyCreateSchema.safeParse({
        ...validProperty,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative priceNight', () => {
      const result = propertyCreateSchema.safeParse({
        ...validProperty,
        priceNight: -100,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid ownerEmail', () => {
      const result = propertyCreateSchema.safeParse({
        ...validProperty,
        ownerEmail: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('propertyUpdateSchema', () => {
    it('should validate partial updates', () => {
      const result = propertyUpdateSchema.safeParse({ name: 'Nuevo Nombre' });
      expect(result.success).toBe(true);
    });

    it('should validate empty object', () => {
      const result = propertyUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid type in update', () => {
      const result = propertyUpdateSchema.safeParse({ type: 'hotel' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Service Schemas', () => {
  const validService = {
    name: 'Servicio de Limpieza',
    description: 'Limpieza profesional del alojamiento',
    classification: 'limpieza' as const,
    type: 'Limpieza general',
    price: 50000,
    rules: ['Solicitar con 24h'],
    active: true,
  };

  describe('serviceCreateSchema', () => {
    it('should validate a correct service', () => {
      const result = serviceCreateSchema.safeParse(validService);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const { name, ...incomplete } = validService;
      const result = serviceCreateSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('should reject invalid classification', () => {
      const result = serviceCreateSchema.safeParse({
        ...validService,
        classification: 'invalida',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = serviceCreateSchema.safeParse({
        ...validService,
        price: -500,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('serviceUpdateSchema', () => {
    it('should validate partial updates', () => {
      const result = serviceUpdateSchema.safeParse({ name: 'Nuevo Nombre' });
      expect(result.success).toBe(true);
    });

    it('should validate empty object', () => {
      const result = serviceUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid classification in update', () => {
      const result = serviceUpdateSchema.safeParse({ classification: 'otra' });
      expect(result.success).toBe(false);
    });
  });
});