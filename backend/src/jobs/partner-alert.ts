// ============================================
// Partner Deadline Checker — Daily Cron Job
// ============================================

import { prisma } from '../config/database.js';
import { sendEmail } from '../email/index.js';
import { buildAlertSubject, buildAlertBody } from '../email/templates/partner-alert.js';

/**
 * Check all partner periods that are overdue and create alerts / send notifications.
 * Runs daily via cron. Each period is processed in its own try/catch to isolate failures.
 */
export async function checkPartnerDeadlines(): Promise<void> {
  const now = new Date();

  let overduePeriods;
  try {
    overduePeriods = await prisma.partnerPeriod.findMany({
      where: {
        status: { in: ['pendiente', 'en_alerta'] },
        deadlineDate: { lt: now },
      },
    });
  } catch (err) {
    console.error('[CRON] Error checking partner deadlines:', err);
    return;
  }

  if (overduePeriods.length === 0) {
    console.log('[CRON] No overdue periods found');
    return;
  }

  const settings = await prisma.settings.findFirst();
  const notificationEmail = settings?.notificationEmail ?? '';

  // Get today's date at midnight for duplicate check
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const period of overduePeriods) {
    try {
      // Check for duplicate alert on the same day
      const existingAlert = await prisma.alertLog.findFirst({
        where: {
          periodId: period.id,
          triggeredAt: { gte: todayStart },
        },
      });

      if (existingAlert) {
        console.log(`[CRON] Skipping period ${period.month} — already alerted today`);
        continue;
      }

      const amountPending = Number(period.amountDue) - Number(period.amountPaid);

      // Create AlertLog entry
      await prisma.alertLog.create({
        data: {
          periodId: period.id,
          amountPending,
        },
      });

      // Update status from pendiente → en_alerta
      if (period.status === 'pendiente') {
        await prisma.partnerPeriod.update({
          where: { id: period.id },
          data: { status: 'en_alerta' },
        });
      }

      // Send email notification if configured
      if (notificationEmail) {
        const result = await sendEmail(
          notificationEmail,
          buildAlertSubject(period),
          buildAlertBody({
            month: period.month,
            amountDue: Number(period.amountDue),
            amountPaid: Number(period.amountPaid),
            amountPending,
            deadlineDate: period.deadlineDate,
            status: period.status,
          })
        );

        if (!result.success) {
          console.error(`[CRON] Failed to send alert for period ${period.month}:`, result.error);
        }
      }
    } catch (err) {
      // Isolated failure — one period failure does not stop others
      console.error(`[CRON] Failed to process period ${period.id}:`, err);
    }
  }
}
