import { prisma } from '../config/database.js';

// ============================================
// REPOSITORY — MEDIA
// ============================================

interface MediaItem {
  url: string;
  mediaType: 'img' | 'video';
  orderIndex: number;
  propertyId?: string;
  serviceId?: string;
}

export async function createMediaForProperty(propertyId: string, items: MediaItem[]) {
  const media = items.map((item) => ({
    entityType: 'property' as const,
    entityId: propertyId,
    url: item.url,
    mediaType: item.mediaType,
    orderIndex: item.orderIndex,
    propertyId,
  }));

  return prisma.media.createMany({ data: media });
}

export async function createMediaForService(serviceId: string, items: MediaItem[]) {
  const media = items.map((item) => ({
    entityType: 'service' as const,
    entityId: serviceId,
    url: item.url,
    mediaType: item.mediaType,
    orderIndex: item.orderIndex,
    serviceId,
  }));

  return prisma.media.createMany({ data: media });
}

export async function deleteMediaByProperty(propertyId: string) {
  return prisma.media.deleteMany({
    where: { propertyId },
  });
}

export async function deleteMediaByService(serviceId: string) {
  return prisma.media.deleteMany({
    where: { serviceId },
  });
}