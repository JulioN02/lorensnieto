import { Router } from 'express';
import { asyncHandler } from '../../middleware/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { prisma } from '../../config/database.js';

export const adminRouter = Router();

// Todas las rutas admin requieren autenticación
adminRouter.use(requireAuth);

// ============================================
// GET /api/admin/me - Perfil del usuario
// ============================================

adminRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.session['userId'] },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    res.json({ success: true, data: user });
  })
);

// ============================================
// GET /api/admin/dashboard - Solo Admin
// ============================================

adminRouter.get(
  '/dashboard',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const [totalProperties, totalServices, totalLeads, totalReservations] =
      await Promise.all([
        prisma.property.count({ where: { active: true } }),
        prisma.service.count({ where: { active: true } }),
        prisma.lead.count({ where: { status: 'nueva' } }),
        prisma.reservation.count(),
      ]);

    res.json({
      success: true,
      data: {
        totalProperties,
        totalServices,
        pendingLeads: totalLeads,
        totalReservations,
      },
    });
  })
);

// ============================================
// GET /api/admin/properties - Listar propiedades
// ============================================

adminRouter.get(
  '/properties',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { type, active } = req.query;

    const where: Record<string, unknown> = {};

    if (type && (type === 'casa_campo' || type === 'apartamento')) {
      where['type'] = type;
    }

    if (active !== undefined) {
      where['active'] = active === 'true';
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        media: {
          orderBy: { orderIndex: 'asc' },
          take: 1,
        },
        _count: {
          select: { reservations: true },
        },
      },
    });

    res.json({ success: true, data: properties });
  })
);

// ============================================
// GET /api/admin/services - Listar servicios
// ============================================

adminRouter.get(
  '/services',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { classification, active } = req.query;

    const where: Record<string, unknown> = {};

    if (classification) {
      where['classification'] = classification;
    }

    if (active !== undefined) {
      where['active'] = active === 'true';
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        media: {
          orderBy: { orderIndex: 'asc' },
          take: 1,
        },
      },
    });

    res.json({ success: true, data: services });
  })
);

// ============================================
// GET /api/admin/leads - Listar leads
// ============================================

adminRouter.get(
  '/leads',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { status } = req.query;

    const where: Record<string, unknown> = {};

    if (status) {
      where['status'] = status;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: { id: true, name: true, type: true },
        },
        service: {
          select: { id: true, name: true, classification: true },
        },
      },
    });

    // Contar leads sin revisar
    const unreadCount = await prisma.lead.count({
      where: { status: 'nueva' },
    });

    res.json({ success: true, data: leads, unreadCount });
  })
);

// ============================================
// GET /api/admin/reservations - Listar reservas
// ============================================

adminRouter.get(
  '/reservations',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { status, propertyId } = req.query;

    const where: Record<string, unknown> = {};

    if (status) {
      where['status'] = status;
    }

    if (propertyId) {
      where['propertyId'] = propertyId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: { id: true, name: true, type: true },
        },
        payments: true,
      },
    });

    res.json({ success: true, data: reservations });
  })
);

// ============================================
// GET /api/admin/partner/summary - Solo Socio Técnico
// ============================================

adminRouter.get(
  '/partner/summary',
  requireRole('partner'),
  asyncHandler(async (req, res) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const period = await prisma.partnerPeriod.findUnique({
      where: { month: currentMonth },
    });

    const settings = await prisma.settings.findFirst();

    // Calcular ingresos del mes
    const monthStart = new Date(`${currentMonth}-01`);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const [reservations, contractings] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          status: { in: ['confirmada', 'en_servicio', 'finalizada'] },
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.contracting.findMany({
        where: {
          status: { in: ['confirmada', 'en_servicio', 'finalizada'] },
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    const arrendamientos = reservations.reduce(
      (sum, r) => sum + Number(r.priceTotal),
      0
    );
    const servicios = contractings.reduce(
      (sum, c) => sum + Number(c.priceTotal),
      0
    );
    const totalIngresos = arrendamientos + servicios;

    res.json({
      success: true,
      data: {
        period,
        settings,
        ingresos: {
          arrendamientos,
          servicios,
          total: totalIngresos,
        },
        partnerAmount: period ? Number(period.amountDue) : 0,
      },
    });
  })
);
