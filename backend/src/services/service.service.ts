import { NotFoundError } from '../middleware/index.js';
import {
  findServiceById,
  createService,
  updateService,
  deleteService as deleteServiceRepo,
  createMediaForService,
  deleteMediaByService,
} from '../repositories/index.js';
import type { ServiceCreateInput, ServiceUpdateInput } from '../models/schemas/index.js';

// ============================================
// SERVICE — SERVICIOS
// ============================================

interface MediaUpload {
  url: string;
  mediaType: 'img' | 'video';
  orderIndex: number;
}

/**
 * Obtener un servicio por ID (lanza 404 si no existe)
 */
export async function getServiceOrFail(id: string) {
  const service = await findServiceById(id);
  if (!service) {
    throw new NotFoundError('Servicio');
  }
  return service;
}

/**
 * Crear un servicio con sus medios asociados
 */
export async function createServiceWithMedia(
  data: ServiceCreateInput,
  media?: MediaUpload[]
) {
  const service = await createService(data);

  if (media && media.length > 0) {
    await createMediaForService(service.id, media);
  }

  // Retornar con medios incluidos
  return findServiceById(service.id);
}

/**
 * Actualizar un servicio y reemplazar sus medios
 */
export async function updateServiceWithMedia(
  id: string,
  data: ServiceUpdateInput,
  media?: MediaUpload[]
) {
  // Verificar que existe
  await getServiceOrFail(id);

  // Si se envían medios, reemplazar los existentes
  if (media) {
    await deleteMediaByService(id);
    if (media.length > 0) {
      await createMediaForService(id, media);
    }
  }

  const service = await updateService(id, data);
  return service;
}

/**
 * Eliminar un servicio (sus medios se eliminan en cascade por Prisma)
 */
export async function removeService(id: string) {
  // Verificar que existe
  await getServiceOrFail(id);
  return deleteServiceRepo(id);
}