// TODO: Replace this mock implementation with a real email provider
// (e.g., Resend, SendGrid, AWS SES, Postmark) before going to production.

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  tags?: string[];
}

export async function sendEmail(
  params: SendEmailParams
): Promise<{ success: boolean; messageId?: string }> {
  const { to, subject, html, tags } = params;

  // --- Mock implementation: log and return success ---
  const messageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  console.log('[email.service] MOCK sendEmail', {
    messageId,
    to,
    subject,
    tags,
    htmlLength: html.length,
  });

  return { success: true, messageId };
}
