import { NotFoundError } from '../middleware/index.js';
import {
  findLeadById,
  updateLeadStatus,
  createLeadNote,
  getLeadNotes,
  findLeads,
} from '../repositories/index.js';
import { createReservation } from '../services/reservation.service.js';
import type {
  LeadStatusUpdateInput,
  LeadNoteInput,
  LeadConvertInput,
} from '../models/schemas/index.js';

// ============================================
// SERVICE — LEADS
// ============================================

/**
 * Obtener un lead por ID (lanza 404 si no existe)
 */
export async function getLeadOrFail(id: string) {
  const lead = await findLeadById(id);
  if (!lead) throw new NotFoundError('Lead');
  return lead;
}

/**
 * Listar leads con filtros opcionales
 */
export async function listLeads(where?: Record<string, unknown>) {
  return findLeads(where);
}

/**
 * Actualizar estado de un lead
 */
export async function updateLeadStatusService(id: string, data: LeadStatusUpdateInput) {
  await getLeadOrFail(id);
  return updateLeadStatus(id, data.status, data.notes);
}

/**
 * Agregar una nota interna a un lead
 */
export async function addLeadNote(id: string, data: LeadNoteInput) {
  await getLeadOrFail(id);
  return createLeadNote(id, data.content);
}

/**
 * Convertir un lead en reserva
 */
export async function convertLeadToReservation(leadId: string, data: LeadConvertInput) {
  const lead = await getLeadOrFail(leadId);

  // Create reservation from lead data
  const reservation = await createReservation({
    propertyId: data.propertyId || lead.propertyId!,
    customerName: lead.customerName,
    customerCedula: lead.customerCedula,
    customerPhone: lead.customerPhone,
    customerEmail: lead.customerEmail,
    dateStart: data.dateStart,
    dateEnd: data.dateEnd,
    additionalServices: data.additionalServices,
    observations: data.observations,
  });

  // Mark lead as converted
  await updateLeadStatus(leadId, 'convertida');

  return reservation;
}

/**
 * Descartar un lead con razón opcional
 */
export async function discardLead(id: string, reason?: string) {
  await getLeadOrFail(id);
  return updateLeadStatus(id, 'descartada', reason);
}
