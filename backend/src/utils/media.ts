import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { config } from '../config/index.js';

// ============================================
// UTILIDADES DE MEDIA — Procesamiento de imágenes
// ============================================

/**
 * Asegura que el directorio de uploads exista
 */
export function ensureUploadDir(): void {
  if (!fs.existsSync(config.upload.dir)) {
    fs.mkdirSync(config.upload.dir, { recursive: true });
  }
}

/**
 * Procesar una imagen: redimensionar y optimizar
 * Devuelve el filename del archivo procesado
 */
export async function processImage(
  filePath: string,
  options?: { width?: number; height?: number; quality?: number }
): Promise<string> {
  const { width = 1200, height = 900, quality = 80 } = options ?? {};

  const parsedPath = path.parse(filePath);
  const outputFilename = `${parsedPath.name}-optimized${parsedPath.ext}`;
  const outputPath = path.join(parsedPath.dir, outputFilename);

  await sharp(filePath)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toFile(outputPath);

  // Reemplazar original con optimizado
  fs.unlinkSync(filePath);
  fs.renameSync(outputPath, filePath);

  return filePath;
}

/**
 * Eliminar un archivo del sistema de archivos
 */
export function deleteFile(filePath: string): boolean {
  try {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}