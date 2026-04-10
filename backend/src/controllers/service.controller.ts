import { Request, Response } from 'express';
import { ValidationError } from '../middleware/index.js';
import { serviceCreateSchema, serviceUpdateSchema } from '../models/schemas/index.js';
import {
  createServiceWithMedia,
  updateServiceWithMedia,
  removeService,
} from '../services/index.js';

// ============================================
// CONTROLLER — SERVICIOS
// ============================================

/**
 * POST /api/admin/services
 * Crear un nuevo servicio
 */
export async function createServiceHandler(req: Request, res: Response): Promise<void> {
  const parsed = serviceCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de servicio inválidos', parsed.error.flatten());
  }

  const media = processUploadedMedia(req);

  const service = await createServiceWithMedia(parsed.data, media);

  res.status(201).json({
    success: true,
    data: service,
    message: 'Servicio creado exitosamente',
  });
}

/**
 * PUT /api/admin/services/:id
 * Actualizar un servicio existente
 */
export async function updateServiceHandler(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string;

  const parsed = serviceUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Datos de servicio inválidos', parsed.error.flatten());
  }

  const media = processUploadedMedia(req);

  const service = await updateServiceWithMedia(id, parsed.data, media);

  res.json({
    success: true,
    data: service,
    message: 'Servicio actualizado exitosamente',
  });
}

/**
 * DELETE /api/admin/services/:id
 * Eliminar un servicio
 */
export async function deleteServiceHandler(req: Request, res: Response): Promise<void> {
  const id = req.params['id'] as string;

  await removeService(id);

  res.json({
    success: true,
    message: 'Servicio eliminado exitosamente',
  });
}

// ============================================
// HELPERS
// ============================================

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