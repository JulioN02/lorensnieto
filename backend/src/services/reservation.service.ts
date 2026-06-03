import { NotFoundError, ConflictError } from '../middleware/index.js';
import {
  findReservationById,
  findReservations,
  findReservationsByProperty,
  findConflictingReservations,
  createReservation as createReservationRepo,
  updateReservation as updateReservationRepo,
  cancelReservation as cancelReservationRepo,
  deleteReservation as deleteReservationRepo,
} from '../repositories/index.js';
import { findPropertyById } from '../repositories/property.repository.js';
import type { ReservationCreateInput, ReservationUpdateInput } from '../models/schemas/index.js';

// ============================================
// SERVICE — RESERVAS
// ============================================

// Constantes para status que permiten modificar fechas
const mutableStatuses = ['pendiente', 'confirmada'] as const;

/**
 * Obtener una reserva por ID (lanza 404 si no existe)
 */
export async function getReservationOrFail(id: string) {
  const reservation = await findReservationById(id);
  if (!reservation) {
    throw new NotFoundError('Reserva');
  }
  return reservation;
}

/**
 * Listar reservas con filtros opcionales
 */
export async function listReservations(where?: Record<string, unknown>) {
  return findReservations(where);
}

/**
 * Listar reservas de una propiedad específica
 */
export async function listReservationsByProperty(propertyId: string) {
  return findReservationsByProperty(propertyId);
}

/**
 * Verificar disponibilidad de fechas para una propiedad
 * Retorna: { available: boolean, conflicts: Reservation[] }
 */
export async function checkAvailability(
  propertyId: string,
  dateStart: Date,
  dateEnd: Date,
  excludeReservationId?: string
) {
  const conflicts = await findConflictingReservations(
    propertyId,
    dateStart,
    dateEnd,
    excludeReservationId
  );

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Calcular precio total de una reserva
 * (noche * días) + servicios adicionales
 */
export async function calculatePrice(
  propertyId: string,
  dateStart: Date,
  dateEnd: Date,
  additionalServices: string[]
) {
  const property = await findPropertyById(propertyId);
  if (!property) {
    throw new NotFoundError('Propiedad');
  }

  // Calcular noches (diff en milisegundos / ms por día)
  const diffTime = dateEnd.getTime() - dateStart.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (nights < 1) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  // Precio base: noches * precio por noche
  const priceNight = Number(property.priceNight);
  const basePrice = priceNight * nights;

  // TODO: Agregar precio de servicios adicionales cuando se implemente el módulo de servicios
  const servicesPrice = 0; // Por implementar

  return {
    nights,
    priceNight,
    basePrice,
    servicesPrice,
    priceTotal: basePrice + servicesPrice,
  };
}

/**
 * Crear una nueva reserva con validación de disponibilidad
 */
export async function createReservation(
  data: ReservationCreateInput,
  calculatePriceOnly = false
) {
  const dateStart = new Date(data.dateStart);
  const dateEnd = new Date(data.dateEnd);

  // Validar que la fecha de inicio sea anterior a la de fin
  if (dateStart >= dateEnd) {
    throw new ConflictError('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  // Verificar disponibilidad
  const { available, conflicts } = await checkAvailability(
    data.propertyId,
    dateStart,
    dateEnd
  );

  if (!available) {
    throw new ConflictError(
      `La propiedad no está disponible en las fechas seleccionadas. Conflictos: ${conflicts.length}`
    );
  }

  // Calcular precio
  const priceInfo = await calculatePrice(
    data.propertyId,
    dateStart,
    dateEnd,
    data.additionalServices
  );

  // Si solo se askede calcular el precio, retornar sin crear
  if (calculatePriceOnly) {
    return { ...priceInfo, available: true };
  }

  // Crear la reserva
  const reservation = await createReservationRepo({
    ...data,
    priceTotal: priceInfo.priceTotal,
  });

  return {
    ...reservation,
    priceInfo,
  };
}

/**
 * Actualizar una reserva existente
 * Solo permite cambiar status y observaciones, o fechas si está en status mutable
 */
export async function updateReservation(
  id: string,
  data: ReservationUpdateInput
) {
  const existing = await getReservationOrFail(id);

  // Si se intentan cambiar fechas, verificar disponibilidad
  if (data.dateStart || data.dateEnd) {
    // Solo property en status mutable puede cambiar fechas
    if (!(mutableStatuses as readonly string[]).includes(existing.status)) {
      throw new ConflictError(
        'No se pueden modificar las fechas de una reserva en estado cancelada, en servicio o finalizada'
      );
    }

    const dateStart = data.dateStart ? new Date(data.dateStart) : existing.dateStart;
    const dateEnd = data.dateEnd ? new Date(data.dateEnd) : existing.dateEnd;

    const { available, conflicts } = await checkAvailability(
      existing.propertyId,
      dateStart,
      dateEnd,
      id
    );

    if (!available) {
      throw new ConflictError(
        'Las nuevas fechas tienen conflictos con otras reservas'
      );
    }
  }

  // Actualizar la reserva
  return updateReservationRepo(id, data);
}

/**
 * Cancelar una reserva (soft delete)
 */
export async function cancelReservation(id: string) {
  await getReservationOrFail(id);
  return cancelReservationRepo(id);
}

/**
 * Eliminar una reserva completamente (hard delete)
 * Solo para casos de error extremo
 */
export async function removeReservation(id: string) {
  await getReservationOrFail(id);
  return deleteReservationRepo(id);
}