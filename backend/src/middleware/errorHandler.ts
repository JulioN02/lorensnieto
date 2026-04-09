import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Clase personalizada para errores de aplicación
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error de validación de datos de entrada
 */
export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Error de recursos no encontrados
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} no encontrado`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Error de conflicto (e.g. doble reserva)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Formatea errores de Zod para respuestas legibles
 */
function formatZodError(error: ZodError): string {
  return error.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
}

/**
 * Manejador global de errores
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.name}:`, err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(err instanceof ValidationError && { details: err.details }),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: formatZodError(err),
    });
    return;
  }

  // Error genérico en desarrollo
  if (process.env['NODE_ENV'] === 'development') {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
    return;
  }

  // Error genérico en producción
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
}

/**
 * Manejador para rutas no definidas
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.path} no encontrada`,
    code: 'ROUTE_NOT_FOUND',
  });
}

/**
 * Middleware async para envolver handlers y capturar errores
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
