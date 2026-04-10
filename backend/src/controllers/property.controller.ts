import { Request, Response } from 'express';
import { ValidationError } from '../middleware/index.js';
import { propertyCreateSchema, propertyUpdateSchema } from '../models/schemas/index.js';
import {
  createPropertyWithMedia,
  updatePropertyWithMedia,
  removeProperty,
} from '../services/index.js';

// ============================================
// CONTROLLER — PROPIEDADES
// ============================================

/**
 * POST /api/admin/properties
 * Crear una nueva propiedad
 */
export async function createPropertyHandler(req: Request, res: Response): Promise<void> {
  const parsed = propertyCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de propiedad inválidos', parsed.error.flatten());
  }

  // Procesar medios subidos (si hay archivos)
  const media = processUploadedMedia(req);

  const property = await createPropertyWithMedia(parsed.data, media);

  res.status(201).json({
    success: true,
    data: property,
    message: 'Propiedad creada exitosamente',
  });
}

/**
 * PUT /api/admin/properties/:id
 * Actualizar una propiedad existente
 */
export async function updatePropertyHandler(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string;

  const parsed = propertyUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de propiedad inválidos', parsed.error.flatten());
  }

  // Procesar medios subidos (si hay archivos)
  const media = processUploadedMedia(req);

  const property = await updatePropertyWithMedia(id, parsed.data, media);

  res.json({
    success: true,
    data: property,
    message: 'Propiedad actualizada exitosamente',
  });
}

/**
 * DELETE /api/admin/properties/:id
 * Eliminar una propiedad
 */
export async function deletePropertyHandler(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string;

  await removeProperty(id);

  res.json({
    success: true,
    message: 'Propiedad eliminada exitosamente',
  });
}

// ============================================
// HELPERS
// ============================================

/**
 * Extraer datos de medios de los archivos subidos via multer
 */
function processUploadedMedia(req: Request): { url: string; mediaType: 'img' | 'video'; orderIndex: number }[] | undefined {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return undefined;
  }

  return files.map((file, index) => ({
    url: `/uploads/${file.filename}`,
    mediaType: file.mimetype.startsWith('video/') ? 'video' as const : 'img' as const,
    orderIndex: index,
  }));
}