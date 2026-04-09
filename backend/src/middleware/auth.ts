import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import type { UserRole } from '../models/types.js';

/**
 * Verifica que el usuario tenga una sesión activa
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session || !req.session['userId']) {
    res.status(401).json({
      success: false,
      error: 'No autenticado',
      code: 'UNAUTHORIZED',
    });
    return;
  }
  next();
}

/**
 * Verifica que el usuario tenga el rol requerido
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !req.session['userId']) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const userRole = req.session['userRole'] as UserRole;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado: permisos insuficientes',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para capturar el usuario actual en requests
 */
export function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.session && req.session['userId']) {
    req['userId'] = req.session['userId'];
    req['userRole'] = req.session['userRole'];
  }
  next();
}

/**
 * Extender Request de Express para incluir userId y userRole
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}
