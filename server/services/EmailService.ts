import nodemailer from 'nodemailer';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';

const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@deephubai.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.deephubai.com';
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';

// Create the SES transport once
const sesClient = new SESClient({ region: AWS_REGION });
const transport = nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SendRawEmailCommand } },
});

export class EmailService {
    /**
     * Sends a password reset email with a secure link.
     */
    static async sendPasswordResetEmail(to: string, token: string, name: string = 'Teacher') {
        const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Reset Your DeepHub Password</title>
</head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo / Brand -->
        <tr><td align="center" style="padding-bottom:32px;">
          <div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-1px;">
            Deep<span style="color:#06b6d4;">Hub</span> <span style="font-size:12px;font-weight:400;color:#64748b;letter-spacing:2px;">AI</span>
          </div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#111827;border:1px solid #1f2937;border-radius:20px;padding:40px;">

          <p style="font-size:22px;font-weight:800;color:#fff;margin:0 0 8px;">Password Reset Request</p>
          <p style="font-size:14px;color:#9ca3af;margin:0 0 32px;">Hi ${name}, we received a request to reset your DeepHub AI password.</p>

          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 32px;">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#0891b2,#1d4ed8);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;letter-spacing:0.3px;">
                Reset My Password →
              </a>
            </td></tr>
          </table>

          <p style="font-size:12px;color:#6b7280;margin:0 0 8px;">This link expires in <strong style="color:#f59e0b;">1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
          
          <hr style="border:none;border-top:1px solid #1f2937;margin:24px 0;"/>

          <p style="font-size:11px;color:#4b5563;margin:0;">Can't click the button? Copy this link:<br/>
          <a href="${resetLink}" style="color:#06b6d4;word-break:break-all;font-size:11px;">${resetLink}</a></p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="font-size:11px;color:#374151;margin:0;">© 2026 DeepHub AI. All rights reserved.</p>
          <p style="font-size:11px;color:#374151;margin:4px 0 0;">This is an automated message — please do not reply.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
        `.trim();

        try {
            await transport.sendMail({
                from: `"DeepHub AI" <${SES_FROM_EMAIL}>`,
                to,
                subject: 'Reset your DeepHub AI password',
                html,
                text: `Hi ${name},\n\nReset your DeepHub AI password here (expires in 1 hour):\n${resetLink}\n\nIf you didn't request this, ignore this email.\n\n— DeepHub AI`,
            });
            console.log(`[EmailService] Reset email sent to: ${to}`);
        } catch (err) {
            console.error('[EmailService] Failed to send reset email:', err);
            throw new Error('Failed to send reset email. Please try again later.');
        }
    }
}
