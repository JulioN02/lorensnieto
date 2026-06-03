import { prisma } from '../config/database.js';
import type { ReservationCreateInput, ReservationUpdateInput } from '../models/schemas/index.js';

// ============================================
// REPOSITORY — RESERVAS
// ============================================

// Buscar una reserva por ID
export async function findReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      property: true,
      payments: true,
      lead: true,
    },
  });
}

// Listar reservas con filtros
export async function findReservations(where?: Record<string, unknown>) {
  return prisma.reservation.findMany({
    where: where ?? {},
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, name: true, type: true } },
      _count: { select: { payments: true } },
    },
  });
}

// Listar reservas de una propiedad
export async function findReservationsByProperty(propertyId: string) {
  return prisma.reservation.findMany({
    where: { propertyId },
    orderBy: { dateStart: 'asc' },
    include: {
      property: { select: { id: true, name: true } },
    },
  });
}

// Buscar reservas que se solapan en fechas (para validación de disponibilidad)
// Excluye reservas canceladas o finalizadas
export async function findConflictingReservations(
  propertyId: string,
  dateStart: Date,
  dateEnd: Date,
  excludeReservationId?: string
) {
  return prisma.reservation.findMany({
    where: {
      propertyId,
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      status: { notIn: ['cancelada', 'finalizada'] },
      OR: [
        // check-in dentro del rango
        { dateStart: { gte: dateStart, lte: dateEnd } },
        // check-out dentro del rango
        { dateEnd: { gte: dateStart, lte: dateEnd } },
        // reserva que abarca el rango completo
        { AND: [{ dateStart: { lte: dateStart } }, { dateEnd: { gte: dateEnd } }] },
      ],
    },
  });
}

// Crear una nueva reserva
export async function createReservation(data: ReservationCreateInput & { priceTotal: number }) {
  return prisma.reservation.create({
    data: {
      propertyId: data.propertyId,
      customerName: data.customerName,
      customerCedula: data.customerCedula,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      dateStart: new Date(data.dateStart),
      dateEnd: new Date(data.dateEnd),
      additionalServices: data.additionalServices,
      priceTotal: data.priceTotal,
      observations: data.observations,
    },
    include: {
      property: true,
    },
  });
}

// Actualizar una reserva existente
export async function updateReservation(id: string, data: ReservationUpdateInput) {
  // Construir data dinámica
  const updateData: Record<string, unknown> = {};
  
  if (data.status !== undefined) updateData.status = data.status;
  if (data.observations !== undefined) updateData.observations = data.observations;
  if (data.dateStart !== undefined) updateData.dateStart = new Date(data.dateStart);
  if (data.dateEnd !== undefined) updateData.dateEnd = new Date(data.dateEnd);
  if (data.additionalServices !== undefined) updateData.additionalServices = data.additionalServices;

  return prisma.reservation.update({
    where: { id },
    data: updateData,
    include: {
      property: true,
      payments: true,
    },
  });
}

// Eliminar una reserva (soft delete: cambiar status a cancelada)
export async function cancelReservation(id: string) {
  return prisma.reservation.update({
    where: { id },
    data: { status: 'cancelada' },
  });
}

// Eliminar una reserva completamente (hard delete)
export async function deleteReservation(id: string) {
  return prisma.reservation.delete({
    where: { id },
  });
}

// Contar reservas por status
export async function countReservationsByStatus(propertyId?: string) {
  const where = propertyId ? { propertyId } : {};
  return prisma.reservation.groupBy({
    by: ['status'],
    where,
    _count: true,
  });
}