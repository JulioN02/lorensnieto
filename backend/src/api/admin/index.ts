import { Router } from 'express';
import {
  asyncHandler,
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../middleware/index.js';
import {
  leadStatusUpdateSchema,
  leadNoteSchema,
  paymentCreateSchema,
  reservationCreateSchema,
} from '../../models/schemas/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { uploadPropertyGallery, uploadServiceGallery } from '../../middleware/upload.js';
import { prisma } from '../../config/database.js';
import {
  createPropertyHandler,
  updatePropertyHandler,
  deletePropertyHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
  listReservationsHandler,
  getReservationHandler,
  listReservationsByPropertyHandler,
  checkAvailabilityHandler,
  calculatePriceHandler,
  createReservationHandler,
  updateReservationHandler,
  cancelReservationHandler,
  deleteReservationHandler,
} from '../../controllers/index.js';

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
// PROPIEDADES — CRUD Admin
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

adminRouter.get(
  '/properties/:id',
  requireRole('admin'),
  asyncHandler(async (req, res): Promise<void> => {
    const id = req.params['id'] as string;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { reservations: true } },
      },
    });
    if (!property) {
      res.status(404).json({ success: false, message: 'Propiedad no encontrada' });
      return;
    }
    res.json({ success: true, data: property });
  })
);

adminRouter.post(
  '/properties',
  requireRole('admin'),
  uploadPropertyGallery,
  asyncHandler(createPropertyHandler)
);

adminRouter.put(
  '/properties/:id',
  requireRole('admin'),
  uploadPropertyGallery,
  asyncHandler(updatePropertyHandler)
);

adminRouter.delete(
  '/properties/:id',
  requireRole('admin'),
  asyncHandler(deletePropertyHandler)
);

// ============================================
// SERVICIOS — CRUD Admin
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

adminRouter.get(
  '/services/:id',
  requireRole('admin'),
  asyncHandler(async (req, res): Promise<void> => {
    const id = req.params['id'] as string;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        media: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!service) {
      res.status(404).json({ success: false, message: 'Servicio no encontrado' });
      return;
    }
    res.json({ success: true, data: service });
  })
);

adminRouter.post(
  '/services',
  requireRole('admin'),
  uploadServiceGallery,
  asyncHandler(createServiceHandler)
);

adminRouter.put(
  '/services/:id',
  requireRole('admin'),
  uploadServiceGallery,
  asyncHandler(updateServiceHandler)
);

adminRouter.delete(
  '/services/:id',
  requireRole('admin'),
  asyncHandler(deleteServiceHandler)
);

// ============================================
// LEADS — Listar (CRUD completo en fase posterior)
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
// LEADS — Detail + Actions
// ============================================

adminRouter.get(
  '/leads/:id',
  requireRole('admin'),
  asyncHandler(async (req, res): Promise<void> => {
    const id = req.params['id'] as string;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        property: true,
        service: true,
        leadNotes: { orderBy: { createdAt: 'desc' } },
        reservation: true,
      },
    });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead no encontrado' });
      return;
    }
    res.json({ success: true, data: lead });
  })
);

adminRouter.patch(
  '/leads/:id/status',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const id = req.params['id'] as string;
    const parsed = leadStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos inválidos', parsed.error.flatten());
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Lead');

    const lead = await prisma.lead.update({
      where: { id },
      data: { status: parsed.data.status, notes: parsed.data.notes ?? existing.notes },
    });

    res.json({ success: true, data: lead, message: 'Estado actualizado' });
  })
);

adminRouter.post(
  '/leads/:id/notes',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const id = req.params['id'] as string;
    const parsed = leadNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Nota inválida', parsed.error.flatten());
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Lead');

    const note = await prisma.leadNote.create({
      data: { leadId: id, content: parsed.data.content },
    });

    res.status(201).json({ success: true, data: note });
  })
);

adminRouter.post(
  '/leads/:id/convert',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const id = req.params['id'] as string;
    const parsed = reservationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos de reserva inválidos', parsed.error.flatten());
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundError('Lead');

    // Create reservation with lead's customer data + form data
    const reservation = await prisma.reservation.create({
      data: {
        propertyId: parsed.data.propertyId,
        customerName: lead.customerName,
        customerCedula: lead.customerCedula,
        customerPhone: lead.customerPhone,
        customerEmail: lead.customerEmail,
        dateStart: new Date(parsed.data.dateStart),
        dateEnd: new Date(parsed.data.dateEnd),
        additionalServices: parsed.data.additionalServices,
        priceTotal: 0, // Will be calculated
        observations: parsed.data.observations,
        leadId: lead.id,
      },
    });

    // Actually calculate the price
    const diffTime = new Date(parsed.data.dateEnd).getTime() - new Date(parsed.data.dateStart).getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const property = await prisma.property.findUnique({ where: { id: parsed.data.propertyId } });
    const priceTotal = Number(property?.priceNight || 0) * nights;

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { priceTotal },
    });

    // Mark lead as converted
    await prisma.lead.update({
      where: { id },
      data: { status: 'convertida' as any },
    });

    const fullReservation = await prisma.reservation.findUnique({
      where: { id: reservation.id },
      include: { property: true },
    });

    res.status(201).json({ success: true, data: fullReservation, message: 'Lead convertido a reserva exitosamente' });
  })
);

// ============================================
// RESERVATIONS — CRUD Completo
// ============================================

adminRouter.get(
  '/reservations',
  requireRole('admin'),
  asyncHandler(listReservationsHandler)
);

adminRouter.get(
  '/reservations/:id',
  requireRole('admin'),
  asyncHandler(getReservationHandler)
);

adminRouter.get(
  '/reservations/property/:propertyId',
  requireRole('admin'),
  asyncHandler(listReservationsByPropertyHandler)
);

adminRouter.post(
  '/reservations/check-availability',
  requireRole('admin'),
  asyncHandler(checkAvailabilityHandler)
);

adminRouter.post(
  '/reservations/calculate-price',
  requireRole('admin'),
  asyncHandler(calculatePriceHandler)
);

adminRouter.post(
  '/reservations',
  requireRole('admin'),
  asyncHandler(createReservationHandler)
);

adminRouter.put(
  '/reservations/:id',
  requireRole('admin'),
  asyncHandler(updateReservationHandler)
);

adminRouter.put(
  '/reservations/:id/cancel',
  requireRole('admin'),
  asyncHandler(cancelReservationHandler)
);

adminRouter.delete(
  '/reservations/:id',
  requireRole('admin'),
  asyncHandler(deleteReservationHandler)
);

// ============================================
// PAYMENTS — Pagos de reservas
// ============================================

adminRouter.get(
  '/reservations/:id/payments',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const id = req.params['id'] as string;
    const payments = await prisma.payment.findMany({
      where: { reservationId: id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: payments });
  })
);

adminRouter.post(
  '/reservations/:id/payments',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const id = req.params['id'] as string;
    const parsed = paymentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Datos de pago inválidos', parsed.error.flatten());
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!reservation) throw new NotFoundError('Reserva');

    // Calculate pending balance
    const totalPaid = (reservation as any).payments
      .filter((p: any) => p.status === 'pagado')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const pendingBalance = Number(reservation.priceTotal) - totalPaid;

    if (Number(parsed.data.amount) > pendingBalance) {
      throw new ConflictError('El monto excede el saldo pendiente');
    }

    const payment = await prisma.payment.create({
      data: {
        reservationId: id,
        amount: parsed.data.amount,
        type: parsed.data.type,
        status: parsed.data.status,
      },
    });

    res.status(201).json({ success: true, data: payment, message: 'Pago registrado exitosamente' });
  })
);

// ============================================
// PARTNER — Solo Socio Técnico
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