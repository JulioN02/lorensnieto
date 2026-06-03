import { Router } from 'express';
import { asyncHandler } from '../../middleware/index.js';
import { requireAuth } from '../../middleware/auth.js';
import { prisma } from '../../config/database.js';

export const partnerRouter = Router();

// All partner routes require auth
partnerRouter.use(requireAuth);

// ============================================
// SUMMARY — Resumen financiero del período activo
// GET /api/partner/summary
// ============================================
partnerRouter.get(
  '/summary',
  asyncHandler(async (req, res): Promise<void> => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const period = await prisma.partnerPeriod.findUnique({
      where: { month: currentMonth },
    });

    const settings = await prisma.settings.findFirst();

    // Calcular ingresos del mes actual
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

    const arrendamientos = reservations.reduce((sum, r) => sum + Number(r.priceTotal), 0);
    const servicios = contractings.reduce((sum, c) => sum + Number(c.priceTotal), 0);
    const totalIngresos = arrendamientos + servicios;

    // Calcular acumulado histórico
    const allPeriods = await prisma.partnerPeriod.findMany();
    const totalAccumulated = allPeriods.reduce((sum, p) => sum + Number(p.amountPaid), 0);
    const totalContractPrice = 3068000; // $3.068.000 COP
    const progressPercent = Math.min(100, Math.round((totalAccumulated / totalContractPrice) * 100));

    // Active alerts
    const activeAlerts = await prisma.alertLog.count({
      where: { resolvedAt: null },
    });

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
        accumulated: {
          total: totalAccumulated,
          target: totalContractPrice,
          percent: progressPercent,
        },
        activeAlerts,
      },
    });
  })
);

// ============================================
// PERIODS — Historial de períodos
// GET /api/partner/periods
// ============================================
partnerRouter.get(
  '/periods',
  asyncHandler(async (_req, res): Promise<void> => {
    const periods = await prisma.partnerPeriod.findMany({
      orderBy: { month: 'desc' },
      include: {
        _count: { select: { alerts: true } },
      },
    });

    res.json({ success: true, data: periods });
  })
);

// ============================================
// PERIOD DETAIL
// GET /api/partner/periods/:id
// ============================================
partnerRouter.get(
  '/periods/:id',
  asyncHandler(async (req, res): Promise<void> => {
    const id = req.params['id'] as string;

    const period = await prisma.partnerPeriod.findUnique({
      where: { id },
      include: {
        alerts: { orderBy: { triggeredAt: 'desc' } },
      },
    });

    if (!period) {
      res.status(404).json({ success: false, message: 'Período no encontrado' });
      return;
    }

    res.json({ success: true, data: period });
  })
);

// ============================================
// CONFIRM PAYMENT — Marcar como pagado
// POST /api/partner/periods/:id/confirm-payment
// ============================================
partnerRouter.post(
  '/periods/:id/confirm-payment',
  asyncHandler(async (req, res): Promise<void> => {
    const id = req.params['id'] as string;

    const period = await prisma.partnerPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      res.status(404).json({ success: false, message: 'Período no encontrado' });
      return;
    }

    const updated = await prisma.partnerPeriod.update({
      where: { id },
      data: {
        status: 'pagado',
        amountPaid: period.amountDue,
        paidAt: new Date(),
      },
    });

    // Resolve any active alerts
    await prisma.alertLog.updateMany({
      where: { periodId: id, resolvedAt: null },
      data: { resolvedAt: new Date() },
    });

    res.json({ success: true, data: updated, message: 'Pago confirmado exitosamente' });
  })
);

// ============================================
// PARTIAL PAYMENT
// POST /api/partner/periods/:id/partial-payment
// ============================================
partnerRouter.post(
  '/periods/:id/partial-payment',
  asyncHandler(async (req, res): Promise<void> => {
    const id = req.params['id'] as string;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Monto inválido' });
      return;
    }

    const period = await prisma.partnerPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      res.status(404).json({ success: false, message: 'Período no encontrado' });
      return;
    }

    const newPaid = Number(period.amountPaid) + Number(amount);
    const newStatus = newPaid >= Number(period.amountDue) ? 'pagado' : 'pagado_parcial';

    const updated = await prisma.partnerPeriod.update({
      where: { id },
      data: {
        amountPaid: newPaid,
        status: newStatus,
        paidAt: newStatus === 'pagado' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: updated, message: 'Pago parcial registrado' });
  })
);

// ============================================
// DISPUTE
// POST /api/partner/periods/:id/dispute
// ============================================
partnerRouter.post(
  '/periods/:id/dispute',
  asyncHandler(async (req, res): Promise<void> => {
    const id = req.params['id'] as string;
    const { notes } = req.body;

    const updated = await prisma.partnerPeriod.update({
      where: { id },
      data: {
        status: 'en_disputa',
        disputeNotes: notes || '',
      },
    });

    res.json({ success: true, data: updated, message: 'Período marcado en disputa' });
  })
);

// ============================================
// ALERTS — Log de alertas (solo lectura)
// GET /api/partner/alerts
// ============================================
partnerRouter.get(
  '/alerts',
  asyncHandler(async (_req, res): Promise<void> => {
    const alerts = await prisma.alertLog.findMany({
      orderBy: { triggeredAt: 'desc' },
      include: {
        period: { select: { month: true, amountDue: true, status: true } },
      },
      take: 50,
    });

    const activeCount = await prisma.alertLog.count({
      where: { resolvedAt: null },
    });

    res.json({ success: true, data: alerts, activeCount });
  })
);

// ============================================
// SETTINGS — Configuración
// GET /api/partner/settings
// PUT /api/partner/settings
// ============================================
partnerRouter.get(
  '/settings',
  asyncHandler(async (_req, res): Promise<void> => {
    const settings = await prisma.settings.findFirst();
    res.json({ success: true, data: settings });
  })
);

partnerRouter.put(
  '/settings',
  asyncHandler(async (req, res): Promise<void> => {
    const { partnerDeadlineDays, commissionPct, notificationEmail, rulesDocUrl } = req.body;

    const existing = await prisma.settings.findFirst();

    if (!existing) {
      const created = await prisma.settings.create({
        data: {
          partnerDeadlineDays: partnerDeadlineDays ?? 5,
          commissionPct: commissionPct ?? 0.10,
          notificationEmail: notificationEmail ?? '',
          rulesDocUrl: rulesDocUrl ?? '',
        },
      });
      res.json({ success: true, data: created });
      return;
    }

    const updated = await prisma.settings.update({
      where: { id: existing.id },
      data: {
        ...(partnerDeadlineDays !== undefined && { partnerDeadlineDays }),
        ...(commissionPct !== undefined && { commissionPct }),
        ...(notificationEmail !== undefined && { notificationEmail }),
        ...(rulesDocUrl !== undefined && { rulesDocUrl }),
      },
    });

    res.json({ success: true, data: updated, message: 'Configuración actualizada' });
  })
);
