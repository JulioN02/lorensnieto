import multer from 'multer';
import path from 'path';
import { config } from '../config/index.js';

// ============================================
// UPLOAD MIDDLEWARE — MULTER
// ============================================

const allowedExtensions = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp4', '.mov', '.avi', '.mkv',
]);

const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
]);

/**
 * Configuración de almacenamiento para Multer
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * Filtro de tipos de archivo
 */
function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExtensions.has(ext) && allowedMimeTypes.has(mime)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}. Solo imágenes y videos.`));
  }
}

/**
 * Instancia configurada de Multer
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 20MB por archivo
    files: 20, // máximo 20 archivos por request
    fieldSize: 1024 * 1024, // 1MB para campos de texto
  },
});

/**
 * Middleware para galería de propiedad (hasta 20 archivos)
 */
export const uploadPropertyGallery = upload.array('media', 20);

/**
 * Middleware para galería de servicio (hasta 10 archivos)
 */
export const uploadServiceGallery = upload.array('media', 10);