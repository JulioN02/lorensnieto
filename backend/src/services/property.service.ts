import { NotFoundError } from '../middleware/index.js';
import {
  findPropertyById,
  createProperty,
  updateProperty,
  deleteProperty as deletePropertyRepo,
  createMediaForProperty,
  deleteMediaByProperty,
} from '../repositories/index.js';
import type { PropertyCreateInput, PropertyUpdateInput } from '../models/schemas/index.js';

// ============================================
// SERVICE — PROPIEDADES
// ============================================

interface MediaUpload {
  url: string;
  mediaType: 'img' | 'video';
  orderIndex: number;
}

/**
 * Obtener una propiedad por ID (lanza 404 si no existe)
 */
export async function getPropertyOrFail(id: string) {
  const property = await findPropertyById(id);
  if (!property) {
    throw new NotFoundError('Propiedad');
  }
  return property;
}

/**
 * Crear una propiedad con sus medios asociados
 */
export async function createPropertyWithMedia(
  data: PropertyCreateInput,
  media?: MediaUpload[]
) {
  const property = await createProperty(data);

  if (media && media.length > 0) {
    await createMediaForProperty(property.id, media);
  }

  // Retornar con medios incluidos
  return findPropertyById(property.id);
}

/**
 * Actualizar una propiedad y reemplazar sus medios
 */
export async function updatePropertyWithMedia(
  id: string,
  data: PropertyUpdateInput,
  media?: MediaUpload[]
) {
  // Verificar que existe
  await getPropertyOrFail(id);

  // Si se envían medios, reemplazar los existentes
  if (media) {
    await deleteMediaByProperty(id);
    if (media.length > 0) {
      await createMediaForProperty(id, media);
    }
  }

  const property = await updateProperty(id, data);
  return property;
}

/**
 * Eliminar una propiedad (sus medios se eliminan en cascade por Prisma)
 */
export async function removeProperty(id: string) {
  // Verificar que existe
  await getPropertyOrFail(id);
  return deletePropertyRepo(id);
}