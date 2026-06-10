// ============================================
// Liquidación Template — Owner Settlement
// CRITICAL: Never show owner contact details or commission percentage
// ============================================

import { rgb } from 'pdf-lib';
import { PdfGenerator, formatCurrency, formatDate, BusinessInfo } from '../index.js';

interface PaymentRecord {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: Date;
}

interface PropertyRecord {
  id: string;
  name: string;
  type: string;
  address: string;
  zone: string;
  priceNight: number;
  ownerName: string;
}

interface ReservationWithData {
  id: string;
  customerName: string;
  customerCedula: string;
  customerPhone: string;
  customerEmail: string;
  dateStart: Date;
  dateEnd: Date;
  priceTotal: number;
  status: string;
  property: PropertyRecord;
  payments: PaymentRecord[];
}

/**
 * Generate a liquidación (owner settlement) PDF for a reservation.
 *
 * SECURITY CONSTRAINTS:
 * - Owner: name ONLY — NEVER phone, email, or cedula
 * - Customer: "Sr(a). {lastName}" ONLY — NEVER full name/contact/cedula
 * - Commission: amount ONLY — NEVER percentage
 */
export async function createLiquidacion(
  reservation: ReservationWithData,
  commissionPct: number
): Promise<Uint8Array> {
  const generator = new PdfGenerator();
  const doc = await generator.createDocument();
  const page = doc.addPage();

  const businessInfo: BusinessInfo = {
    businessName: 'Lorens Nieto',
    nit: '123456789-0',
    address: 'Valledupar, Cesar',
    phone: '+57 300 000 0000',
    email: 'contacto@lorensnieto.com',
  };

  // === HEADER ===
  generator.addHeader(page, businessInfo);

  // === TITLE ===
  let currentY = 660;
  generator.drawSectionTitle(page, 'LIQUIDACIÓN PROPIETARIO', currentY);
  currentY -= 25;

  // === Document info ===
  generator.drawField(page, 'Liquidación No.:', reservation.id, currentY);
  currentY = generator.drawField(page, 'Fecha de emisión:', formatDate(new Date()), currentY);

  currentY -= 10;

  // === Owner info — NAME ONLY ===
  generator.drawSectionTitle(page, 'PROPIETARIO', currentY, 11);
  currentY -= 5;
  // Owner name ONLY — no phone, email, or cedula per security constraint
  generator.drawField(page, 'Nombre:', reservation.property.ownerName, currentY);
  currentY -= 15;

  // === Property info ===
  generator.drawSectionTitle(page, 'PROPIEDAD', currentY, 11);
  currentY -= 5;
  currentY = generator.drawField(page, 'Nombre:', reservation.property.name, currentY);
  currentY = generator.drawField(page, 'Dirección:', reservation.property.address, currentY);
  currentY = generator.drawField(page, 'Zona:', reservation.property.zone, currentY);

  currentY -= 10;

  // === Customer info — MASKED ===
  generator.drawSectionTitle(page, 'CLIENTE', currentY, 11);
  currentY -= 5;
  // Extract last name only — no full name, no contact details
  const nameParts = reservation.customerName.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1]! : nameParts[0]!;
  generator.drawField(page, 'Cliente:', `Sr(a). ${lastName}`, currentY);
  currentY -= 15;

  // === Period ===
  generator.drawSectionTitle(page, 'PERÍODO', currentY, 11);
  currentY -= 5;
  const dateStart = new Date(reservation.dateStart);
  const dateEnd = new Date(reservation.dateEnd);
  currentY = generator.drawField(page, 'Check-in:', formatDate(dateStart), currentY);
  currentY = generator.drawField(page, 'Check-out:', formatDate(dateEnd), currentY);

  currentY -= 10;

  // === Financial summary ===
  generator.drawSectionTitle(page, 'RESUMEN FINANCIERO', currentY, 11);
  currentY -= 5;

  const grossAmount = Number(reservation.priceTotal);
  const commissionAmount = Math.round(grossAmount * commissionPct);
  const netAmount = grossAmount - commissionAmount;

  currentY = generator.drawField(page, 'Valor bruto:', formatCurrency(grossAmount), currentY);
  // Commission: amount ONLY — NO percentage
  currentY = generator.drawField(page, 'Deducción:', formatCurrency(commissionAmount), currentY);
  currentY -= 5;

  // NET amount — bold / highlighted
  page.drawText('NETO A PAGAR:', {
    x: 50,
    y: currentY,
    size: 12,
    font: generator.boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText(formatCurrency(netAmount), {
    x: 50 + 120,
    y: currentY,
    size: 12,
    font: generator.font,
    color: rgb(0, 0.4, 0),
  });

  currentY -= 30;

  // === FOOTER ===
  generator.addFooter(page, 1, 1);

  return doc.save();
}
