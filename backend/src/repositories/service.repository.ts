import { prisma } from '../config/database.js';
import type { ServiceCreateInput, ServiceUpdateInput } from '../models/schemas/index.js';

// ============================================
// REPOSITORY — SERVICIOS
// ============================================

export async function findServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      media: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export async function findServices(where?: Record<string, unknown>) {
  return prisma.service.findMany({
    where: where ?? {},
    orderBy: { createdAt: 'desc' },
    include: {
      media: { orderBy: { orderIndex: 'asc' }, take: 1 },
    },
  });
}

export async function createService(data: ServiceCreateInput) {
  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description,
      classification: data.classification,
      type: data.type,
      price: data.price,
      rules: data.rules,
      active: data.active,
    },
    include: {
      media: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export async function updateService(id: string, data: ServiceUpdateInput) {
  return prisma.service.update({
    where: { id },
    data,
    include: {
      media: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

export async function deleteService(id: string) {
  return prisma.service.delete({
    where: { id },
  });
}