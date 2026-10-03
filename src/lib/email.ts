/**
 * Email Service (Optional)
 * 
 * This file provides hook points for sending emails via Resend.
 * It is behind a feature flag (ENABLE_EMAILS) and is disabled by default.
 * 
 * To enable:
 * 1. npm install resend
 * 2. Set ENABLE_EMAILS=true in your environment
 * 3. Set RESEND_API_KEY in your environment
 */

const ENABLE_EMAILS = process.env.ENABLE_EMAILS === "true";
// const resend = ENABLE_EMAILS ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendApplicationConfirmationEmail(email: string, studentName: string, internshipTitle: string) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Application Confirmation -> ${email}: Dear ${studentName}, your application for ${internshipTitle} has been received.`);
  /*
  await resend.emails.send({
    from: 'CodeElevate <noreply@codeelevate.com>',
    to: email,
    subject: `Application Received: ${internshipTitle}`,
    html: `<p>Dear ${studentName},</p><p>We have received your application for the ${internshipTitle} program. Our team is reviewing it.</p>`
  });
  */
}

export async function sendApplicationApprovedEmail(email: string, studentName: string, internshipTitle: string) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Application Approved -> ${email}`);
}

export async function sendApplicationRejectedEmail(email: string, studentName: string, internshipTitle: string, reason: string) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Application Rejected -> ${email}`);
}

export async function sendTaskResultEmail(email: string, studentName: string, taskTitle: string, status: "APPROVED" | "REJECTED", feedback?: string) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Task ${status} -> ${email}`);
}

export async function sendPaymentReceiptEmail(email: string, studentName: string, orderId: string, amount: string) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Payment Receipt -> ${email} (Order: ${orderId}, Amount: ${amount})`);
}

export async function sendCertificateIssuedEmail(email: string, studentName: string, certificateUrl: string) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Certificate Issued -> ${email} (${certificateUrl})`);
}
