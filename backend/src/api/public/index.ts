import { Router } from 'express';
import { asyncHandler } from '../../middleware/index.js';
import { prisma } from '../../config/database.js';

export const publicRouter = Router();

// ============================================
// GET /api/public/properties
// ============================================

publicRouter.get(
  '/properties',
  asyncHandler(async (req, res) => {
    const { type, zone, capacity, search, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { active: true };

    if (type && (type === 'casa_campo' || type === 'apartamento')) {
      where['type'] = type;
    }

    if (zone) {
      where['zone'] = { contains: String(zone), mode: 'insensitive' };
    }

    if (capacity) {
      where['capacity'] = { gte: parseInt(capacity as string, 10) };
    }

    if (search) {
      where['OR'] = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { zone: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          media: {
            where: { mediaType: 'img' },
            orderBy: { orderIndex: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);

// ============================================
// GET /api/public/properties/:id
// ============================================

publicRouter.get(
  '/properties/:id',
  asyncHandler(async (req, res) => {
    const property = await prisma.property.findUnique({
      where: { id: req.params['id'], active: true },
      include: {
        media: {
          where: { mediaType: 'img' },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!property) {
      res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.json({ success: true, data: property });
  })
);

// ============================================
// GET /api/public/services
// ============================================

publicRouter.get(
  '/services',
  asyncHandler(async (req, res) => {
    const { classification, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { active: true };

    if (
      classification &&
      ['alimentacion', 'limpieza', 'otros'].includes(classification as string)
    ) {
      where['classification'] = classification;
    }

    if (search) {
      where['OR'] = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          media: {
            where: { mediaType: 'img' },
            orderBy: { orderIndex: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);

// ============================================
// GET /api/public/services/:id
// ============================================

publicRouter.get(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const service = await prisma.service.findUnique({
      where: { id: req.params['id'], active: true },
      include: {
        media: {
          where: { mediaType: 'img' },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Servicio no encontrado',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.json({ success: true, data: service });
  })
);

// ============================================
// POST /api/public/leads (Formulario público)
// ============================================

publicRouter.post(
  '/leads',
  asyncHandler(async (req, res) => {
    const { customerName, customerCedula, customerPhone, customerEmail, propertyId, serviceId, dateInterest, additionalServices } = req.body;

    if (!customerName || !customerCedula || !customerPhone || !customerEmail) {
      res.status(400).json({
        success: false,
        error: 'Todos los campos obligatorios deben estar completos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    if (!propertyId && !serviceId) {
      res.status(400).json({
        success: false,
        error: 'Debe especificar una propiedad o un servicio',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const lead = await prisma.lead.create({
      data: {
        customerName,
        customerCedula,
        customerPhone,
        customerEmail,
        propertyId: propertyId || null,
        serviceId: serviceId || null,
        dateInterest: dateInterest ? new Date(dateInterest) : null,
        additionalServices: additionalServices ?? [],
        status: 'nueva',
      },
    });

    res.status(201).json({
      success: true,
      data: lead,
      message: 'Solicitud enviada correctamente',
    });
  })
);
