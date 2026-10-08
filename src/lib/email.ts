/**
 * Email Service
 *
 * Contact form emails are delivered via Resend API.
 * Other notification emails (application, task, certificate) are behind
 * the ENABLE_EMAILS feature flag and are currently console-only stubs.
 *
 * Required env vars:
 *   RESEND_API_KEY          – Resend API Key (starts with re_...)
 *   CONTACT_RECEIVER_EMAIL  – (Optional) Destination inbox for contact inquiries (defaults to codeelevate.team@outlook.com)
 */

import { Resend } from "resend";

const ENABLE_EMAILS = process.env.ENABLE_EMAILS === "true";

// ---------------------------------------------------------------------------
// Helpers: Input sanitisation & HTML escaping
// ---------------------------------------------------------------------------

/**
 * Strips carriage returns and line feeds to prevent header injection in email metadata
 */
function stripLineBreaks(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Escapes special HTML characters to prevent XSS/injection in email HTML templates
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// Resend client (lazy-initialised singleton)
// ---------------------------------------------------------------------------

let _resendClient: Resend | null = null;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Missing RESEND_API_KEY environment variable. Please configure it in .env.local."
    );
  }

  if (!_resendClient) {
    _resendClient = new Resend(apiKey.trim());
  }

  return _resendClient;
}

// ---------------------------------------------------------------------------
// Contact form email
// ---------------------------------------------------------------------------

export async function sendContactMessageEmail(data: {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  paymentIdRef?: string;
}) {
  const resend = getResendClient();

  const receiverEmail =
    process.env.CONTACT_RECEIVER_EMAIL?.trim() || "codeelevate.team@outlook.com";

  if (!receiverEmail) {
    throw new Error(
      "Missing CONTACT_RECEIVER_EMAIL environment variable and no fallback found."
    );
  }

  // Strip line breaks for subject, headers, and single-line metadata
  const safeName = stripLineBreaks(data.name || "");
  const safeEmail = stripLineBreaks(data.email || "");
  const safeTopic = stripLineBreaks(data.topic || "General");
  const safePhone = data.phone ? stripLineBreaks(data.phone) : "Not provided";
  const safePaymentId = data.paymentIdRef ? stripLineBreaks(data.paymentIdRef) : null;
  const rawMessage = (data.message || "").trim();

  const subject = `[${safeTopic}] New inquiry from ${safeName}`;

  // Plain text email body
  const textBody = [
    `New Contact Form Submission`,
    `──────────────────────────────`,
    `Name:        ${safeName}`,
    `Email:       ${safeEmail}`,
    `Phone:       ${safePhone}`,
    `Topic:       ${safeTopic}`,
    safePaymentId ? `Payment ID:  ${safePaymentId}` : null,
    `──────────────────────────────`,
    `Message:`,
    ``,
    rawMessage,
    ``,
    `──────────────────────────────`,
    `This email was sent automatically from the CodeElevate Contact Form.`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  // Rich HTML email body (all dynamic user inputs HTML-escaped)
  const escapedName = escapeHtml(safeName);
  const escapedEmail = escapeHtml(safeEmail);
  const escapedPhone = escapeHtml(safePhone);
  const escapedTopic = escapeHtml(safeTopic);
  const escapedPaymentId = safePaymentId ? escapeHtml(safePaymentId) : null;
  const escapedMessage = escapeHtml(rawMessage).replace(/\n/g, "<br />");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">CodeElevate Support Desk</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">New contact form message received</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px; font-weight: 600;">Name:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${escapedName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
            <td style="padding: 8px 0; color: #2563eb; font-weight: 600;">
              <a href="mailto:${escapedEmail}" style="color: #2563eb; text-decoration: underline;">${escapedEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
            <td style="padding: 8px 0; color: #0f172a;">${escapedPhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Topic:</td>
            <td style="padding: 8px 0;">
              <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe;">
                ${escapedTopic}
              </span>
            </td>
          </tr>
          ${
            escapedPaymentId
              ? `<tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Payment Ref:</td>
            <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-size: 13px;">${escapedPaymentId}</td>
          </tr>`
              : ""
          }
        </table>

        <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">Message Content:</h3>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${escapedMessage}
          </div>
        </div>

        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
          You can reply directly to this email to contact the student (${escapedEmail}).
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Send email using Resend SDK
  const { data: sendData, error } = await resend.emails.send({
    from: "CodeElevate Website <onboarding@resend.dev>",
    to: receiverEmail,
    replyTo: safeEmail,
    subject,
    text: textBody,
    html: htmlBody,
  });

  if (error) {
    console.error("[EMAIL][ERROR]", error);
    throw new Error(
      "Email delivery failed. Your message has been saved and our team will see it in the admin dashboard."
    );
  }

  console.log(
    `[EMAIL][SENT] Contact Inquiry -> [${safeTopic}] from ${safeName} (${safeEmail}) [Resend ID: ${sendData?.id}]`
  );
}

// ---------------------------------------------------------------------------
// Other notification emails (feature-flagged, console-only for now)
// ---------------------------------------------------------------------------

export async function sendApplicationConfirmationEmail(
  email: string,
  studentName: string,
  internshipTitle: string
) {
  if (!ENABLE_EMAILS) return;
  console.log(
    `[EMAIL] Application Confirmation -> ${email}: Dear ${studentName}, your application for ${internshipTitle} has been received.`
  );
}

export async function sendApplicationApprovedEmail(
  email: string,
  studentName: string,
  internshipTitle: string
) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Application Approved -> ${email}`);
}

export async function sendApplicationRejectedEmail(
  email: string,
  studentName: string,
  internshipTitle: string,
  reason: string
) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Application Rejected -> ${email}`);
}

export async function sendTaskResultEmail(
  email: string,
  studentName: string,
  taskTitle: string,
  status: "APPROVED" | "REJECTED",
  feedback?: string
) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Task ${status} -> ${email}`);
}

export async function sendPaymentReceiptEmail(
  email: string,
  studentName: string,
  orderId: string,
  amount: string
) {
  if (!ENABLE_EMAILS) return;
  console.log(
    `[EMAIL] Payment Receipt -> ${email} (Order: ${orderId}, Amount: ${amount})`
  );
}

export async function sendCertificateIssuedEmail(
  email: string,
  studentName: string,
  certificateUrl: string
) {
  if (!ENABLE_EMAILS) return;
  console.log(`[EMAIL] Certificate Issued -> ${email} (${certificateUrl})`);
}
