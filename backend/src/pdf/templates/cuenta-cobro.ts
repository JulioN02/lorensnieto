// ============================================
// Cuenta de Cobro Template — Partner Collection Letter
// ============================================

import { rgb } from 'pdf-lib';
import { PdfGenerator, formatCurrency, formatDate, BusinessInfo } from '../index.js';

export interface PartnerPeriodWithAccumulated {
  id: string;
  month: string;
  revenueTotal: number;
  phase: string;
  pctApplied: number;
  amountDue: number;
  amountPaid: number;
  status: string;
  deadlineDate: Date;
  accumulatedPaid: number;
  targetAmount: number;
  arrendamientos: number;
  servicios: number;
}

/**
 * Generate a cuenta de cobro (partner collection letter) PDF
 */
export async function createCuentaCobro(period: PartnerPeriodWithAccumulated): Promise<Uint8Array> {
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
  generator.drawSectionTitle(page, 'CUENTA DE COBRO — SOCIO TÉCNICO', currentY);
  currentY -= 25;

  // === Period ===
  generator.drawField(page, 'Período:', period.month, currentY);
  currentY = generator.drawField(page, 'Fecha de emisión:', formatDate(new Date()), currentY);

  currentY -= 15;

  // === Revenue breakdown ===
  generator.drawSectionTitle(page, 'INGRESOS DEL PERÍODO', currentY, 11);
  currentY -= 5;
  currentY = generator.drawField(page, 'Arrendamientos:', formatCurrency(period.arrendamientos), currentY);
  currentY = generator.drawField(page, 'Servicios:', formatCurrency(period.servicios), currentY);
  currentY = generator.drawField(page, 'Total ingresos:', formatCurrency(period.revenueTotal), currentY);

  currentY -= 10;

  // === Phase & percentage ===
  generator.drawSectionTitle(page, 'CÁLCULO DE PARTICIPACIÓN', currentY, 11);
  currentY -= 5;

  const phaseLabel = period.phase === 'fase_1' ? 'Fase 1' : 'Fase 2';
  const pctDisplay = (Number(period.pctApplied) * 100).toFixed(2);

  currentY = generator.drawField(page, 'Fase:', phaseLabel, currentY);
  currentY = generator.drawField(page, 'Porcentaje aplicado:', `${pctDisplay}%`, currentY);

  currentY -= 10;

  // === Amounts ===
  generator.drawSectionTitle(page, 'VALORES', currentY, 11);
  currentY -= 5;
  currentY = generator.drawField(page, 'Valor a pagar:', formatCurrency(Number(period.amountDue)), currentY);
  currentY = generator.drawField(page, 'Pagado a la fecha:', formatCurrency(Number(period.amountPaid)), currentY);

  const pending = Number(period.amountDue) - Number(period.amountPaid);
  currentY = generator.drawField(page, 'Saldo pendiente:', formatCurrency(Math.max(0, pending)), currentY);

  currentY -= 15;

  // === Accumulated progress ===
  generator.drawSectionTitle(page, 'PROGRESO ACUMULADO', currentY, 11);
  currentY -= 5;

  const accumulated = Number(period.accumulatedPaid);
  const target = Number(period.targetAmount);
  const progressPercent = Math.min(100, Math.round((accumulated / target) * 100));

  currentY = generator.drawField(page, 'Total acumulado:', formatCurrency(accumulated), currentY);
  currentY = generator.drawField(page, 'Meta del contrato:', formatCurrency(target), currentY);

  // Progress bar (text-based)
  const barWidth = 40;
  const filled = Math.round((progressPercent / 100) * barWidth);
  const empty = barWidth - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, empty));

  page.drawText(`[${bar}] ${progressPercent}%`, {
    x: 50,
    y: currentY - 5,
    size: 10,
    font: generator.font,
    color: rgb(0.2, 0.2, 0.2),
  });

  currentY -= 25;

  // === FOOTER ===
  generator.addFooter(page, 1, 1);

  return doc.save();
}
