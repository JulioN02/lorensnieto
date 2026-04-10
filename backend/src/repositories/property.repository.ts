import { prisma } from '../config/database.js';
import type { PropertyCreateInput, PropertyUpdateInput } from '../models/schemas/index.js';

// ============================================
// REPOSITORY — PROPIEDADES
// ============================================

export async function findPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      media: { orderBy: { orderIndex: 'asc' } },
      _count: { select: { reservations: true } },
    },
  });
}

export async function findProperties(where?: Record<string, unknown>) {
  return prisma.property.findMany({
    where: where ?? {},
    orderBy: { createdAt: 'desc' },
    include: {
      media: { orderBy: { orderIndex: 'asc' }, take: 1 },
      _count: { select: { reservations: true } },
    },
  });
}

export async function createProperty(data: PropertyCreateInput) {
  return prisma.property.create({
    data: {
      type: data.type,
      name: data.name,
      description: data.description,
      zone: data.zone,
      address: data.address,
      capacity: data.capacity,
      rooms: data.rooms,
      priceNight: data.priceNight,
      amenities: data.amenities,
      rules: data.rules,
      active: data.active,
      ownerName: data.ownerName,
      ownerCedula: data.ownerCedula,
      ownerPhone: data.ownerPhone,
      ownerEmail: data.ownerEmail,
    },
    include: {
      media: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export async function updateProperty(id: string, data: PropertyUpdateInput) {
  return prisma.property.update({
    where: { id },
    data,
    include: {
      media: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export async function deleteProperty(id: string) {
  return prisma.property.delete({
    where: { id },
  });
}