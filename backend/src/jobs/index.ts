// ============================================
// Cron Jobs — Initialization
// ============================================

import cron from 'node-cron';
import { config } from '../config/index.js';
import { checkPartnerDeadlines } from './partner-alert.js';

/**
 * Initialize all cron jobs.
 * Called once at server startup (from app.ts).
 * Skips entirely in test environment.
 */
export function initCronJobs(): void {
  if (config.nodeEnv === 'test') {
    console.log('[CRON] Skipped — test environment');
    return;
  }

  // Daily at 9:00 AM Bogota time (America/Bogota)
  cron.schedule(
    '0 9 * * *',
    () => {
      checkPartnerDeadlines().catch((err) => {
        console.error('[CRON] partner-alert failed:', err);
      });
    },
    {
      scheduled: true,
      timezone: 'America/Bogota',
    }
  );

  console.log('[CRON] Jobs initialized');
}
