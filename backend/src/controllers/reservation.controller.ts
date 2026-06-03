import { Request, Response } from 'express';
import { ValidationError } from '../middleware/index.js';
import {
  reservationCreateSchema,
  reservationUpdateSchema,
  availabilityCheckSchema,
} from '../models/schemas/index.js';
import {
  getReservationOrFail,
  listReservations,
  listReservationsByProperty,
  checkAvailability,
  calculatePrice,
  createReservation,
  updateReservation,
  cancelReservation,
  removeReservation,
} from '../services/index.js';

// ============================================
// CONTROLLER — RESERVAS
// ============================================

/**
 * GET /api/admin/reservations
 * Listar todas las reservas con filtros opcionales
 */
export async function listReservationsHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { status, propertyId } = req.query;

  const where: Record<string, unknown> = {};

  if (status) {
    where['status'] = status;
  }

  if (propertyId) {
    where['propertyId'] = propertyId;
  }

  const reservations = await listReservations(where);

  res.json({
    success: true,
    data: reservations,
  });
}

/**
 * GET /api/admin/reservations/:id
 * Obtener una reserva específica
 */
export async function getReservationHandler(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params['id'] as string;
  const reservation = await getReservationOrFail(id);

  res.json({
    success: true,
    data: reservation,
  });
}

/**
 * GET /api/admin/reservations/property/:propertyId
 * Listar reservas de una propiedad específica
 */
export async function listReservationsByPropertyHandler(
  req: Request,
  res: Response
): Promise<void> {
  const propertyId = req.params['propertyId'] as string;
  const reservations = await listReservationsByProperty(propertyId);

  res.json({
    success: true,
    data: reservations,
  });
}

/**
 * POST /api/admin/reservations/check-availability
 * Verificar disponibilidad de fechas para una propiedad
 */
export async function checkAvailabilityHandler(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = availabilityCheckSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de disponibilidad inválidos', parsed.error.flatten());
  }

  const { propertyId, dateStart, dateEnd } = parsed.data;

  const { available, conflicts } = await checkAvailability(
    propertyId,
    new Date(dateStart),
    new Date(dateEnd)
  );

  res.json({
    success: true,
    data: {
      available,
      propertyId,
      dateStart,
      dateEnd,
      conflicts: conflicts.length,
    },
  });
}

/**
 * POST /api/admin/reservations/calculate-price
 * Calcular precio de una reserva sin crear
 */
export async function calculatePriceHandler(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = reservationCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de reserva inválidos', parsed.error.flatten());
  }

  const { propertyId, dateStart, dateEnd, additionalServices } = parsed.data;

  const priceInfo = await calculatePrice(
    propertyId,
    new Date(dateStart),
    new Date(dateEnd),
    additionalServices
  );

  res.json({
    success: true,
    data: priceInfo,
  });
}

/**
 * POST /api/admin/reservations
 * Crear una nueva reserva
 */
export async function createReservationHandler(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = reservationCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de reserva inválidos', parsed.error.flatten());
  }

  const reservation = await createReservation(parsed.data);

  res.status(201).json({
    success: true,
    data: reservation,
    message: 'Reserva creada exitosamente',
  });
}

/**
 * PUT /api/admin/reservations/:id
 * Actualizar una reserva existente
 */
export async function updateReservationHandler(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params['id'] as string;

  const parsed = reservationUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de reserva inválidos', parsed.error.flatten());
  }

  const reservation = await updateReservation(id, parsed.data);

  res.json({
    success: true,
    data: reservation,
    message: 'Reserva actualizada exitosamente',
  });
}

/**
 * PUT /api/admin/reservations/:id/cancel
 * Cancelar una reserva (soft delete)
 */
export async function cancelReservationHandler(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params['id'] as string;

  await cancelReservation(id);

  res.json({
    success: true,
    message: 'Reserva cancelada exitosamente',
  });
}

/**
 * DELETE /api/admin/reservations/:id
 * Eliminar una reserva completamente (hard delete)
 */
export async function deleteReservationHandler(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params['id'] as string;

  await removeReservation(id);

  res.json({
    success: true,
    message: 'Reserva eliminada permanentemente',
  });
}