// ============================================
// Email Module — Nodemailer transporter singleton
// ============================================

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config/index.js';

let transporterInstance: Transporter | null = null;
let smtpChecked = false;

/**
 * Get or create the Nodemailer transporter singleton.
 * Returns null if SMTP is not configured (graceful fallback).
 */
export function getTransporter(): Transporter | null {
  if (smtpChecked) {
    return transporterInstance;
  }

  smtpChecked = true;

  const { host, port, user, pass } = config.smtp;

  if (!host || !user || !pass) {
    console.warn('[EMAIL] SMTP no configurado, correo no enviado');
    transporterInstance = null;
    return null;
  }

  transporterInstance = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporterInstance;
}

/**
 * Send an email via the configured SMTP transporter.
 * Gracefully handles missing SMTP config — never throws.
 *
 * @returns { success: true, messageId } on success
 * @returns { success: false, error } on failure or skipped
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ success: true; messageId: string } | { success: false; error: string }> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      return { success: false, error: 'SMTP not configured' };
    }

    const info = await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      text: body,
    });

    console.log(`[EMAIL] Sent: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[EMAIL] Send failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}
