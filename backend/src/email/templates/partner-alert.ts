// ============================================
// Partner Alert Email Templates
// ============================================

/**
 * Build the subject line for a partner overdue alert email
 */
export function buildAlertSubject(period: { month: string }): string {
  return `⚠️ ALERTA: Período vencido — ${period.month}`;
}

interface AlertPeriodData {
  month: string;
  amountDue: number;
  amountPaid: number;
  amountPending?: number;
  deadlineDate: Date;
  status: string;
}

/**
 * Build the plain-text body for a partner overdue alert email
 */
export function buildAlertBody(period: AlertPeriodData): string {
  const daysOverdue = Math.floor(
    (Date.now() - new Date(period.deadlineDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const pending = period.amountPending ?? Number(period.amountDue) - Number(period.amountPaid);

  const lines: string[] = [
    '=== ALERTA DE PERÍODO VENCIDO ===',
    '',
    `Período: ${period.month}`,
    `Fecha límite: ${new Date(period.deadlineDate).toLocaleDateString('es-CO')}`,
    `Días de vencido: ${daysOverdue}`,
    `Estado actual: ${period.status}`,
    '',
    '--- Resumen financiero ---',
    `Valor a pagar: $${Number(period.amountDue).toLocaleString('es-CO')}`,
    `Pagado: $${Number(period.amountPaid).toLocaleString('es-CO')}`,
    `Saldo pendiente: $${pending.toLocaleString('es-CO')}`,
    '',
    'Por favor, ingrese al panel de socio técnico para gestionar el pago.',
    '',
    'Lorens Nieto — Sistema de Gestión Integral',
  ];

  return lines.join('\n');
}
