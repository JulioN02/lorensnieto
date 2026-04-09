import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import {
  asyncHandler,
  ValidationError,
  NotFoundError,
  authLimiter,
} from '../../middleware/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import type { UserRole } from '../../models/types.js';

export const authRouter = Router();

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

// ============================================
// POST /api/auth/login
// ============================================

authRouter.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError('Credenciales inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new ValidationError('Credenciales inválidas');
    }

    // Guardar sesión
    req.session['userId'] = user.id;
    req.session['userRole'] = user.role as UserRole;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  })
);

// ============================================
// POST /api/auth/logout
// ============================================

authRouter.post(
  '/logout',
  requireAuth,
  (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: 'Error al cerrar sesión',
        });
        return;
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Sesión cerrada' });
    });
  }
);

// ============================================
// GET /api/auth/me
// ============================================

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.session['userId'] },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    res.json({ success: true, data: user });
  })
);

// CSRF protection via SameSite cookie es suficiente con httpOnly
