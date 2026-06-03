import { prisma } from '../config/database.js';

// ============================================
// REPOSITORY — LEADS
// ============================================

export async function findLeads(where?: Record<string, unknown>) {
  return prisma.lead.findMany({
    where: where ?? {},
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, name: true, type: true } },
      service: { select: { id: true, name: true, classification: true } },
      leadNotes: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function findLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      property: true,
      service: true,
      leadNotes: { orderBy: { createdAt: 'desc' } },
      reservation: true,
      contracting: { include: { services: true } },
    },
  });
}

export async function updateLeadStatus(id: string, status: string, notes?: string) {
  const data: Record<string, unknown> = { status };
  if (notes !== undefined) data.notes = notes;
  return prisma.lead.update({ where: { id }, data });
}

export async function createLeadNote(leadId: string, content: string) {
  return prisma.leadNote.create({ data: { leadId, content } });
}

export async function getLeadNotes(leadId: string) {
  return prisma.leadNote.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function countLeadsByStatus(status: string) {
  return prisma.lead.count({ where: { status: status as any } });
}
