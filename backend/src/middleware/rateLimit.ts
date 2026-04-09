import rateLimit from 'express-rate-limit';

/**
 * Rate limit general para endpoints públicos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Rate limit estricto para endpoints de autenticación
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiados intentos de login, intenta de nuevo en 15 minutos',
    code: 'AUTH_RATE_LIMIT',
  },
});

/**
 * Rate limit para subida de archivos (evitar abuse)
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiados archivos subidos, intenta de nuevo en un minuto',
    code: 'UPLOAD_RATE_LIMIT',
  },
});
