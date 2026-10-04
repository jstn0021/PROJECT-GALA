import nodemailer from "nodemailer";

function createTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendResetEmail(to, name, resetUrl) {
  const transporter = createTransport();

  // Fallback sa development kung wala pang SMTP settings
  if (!transporter) {
    console.log(`\n[mailer] SMTP not configured. Reset link:\n${resetUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your PROJECT-GALA password",
    text:
      `Hi ${name},\n\n` +
      `We received a request to reset your password. Open this link within 1 hour:\n` +
      `${resetUrl}\n\n` +
      `If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0b1f33">
        <h2 style="margin:0 0 8px">PROJECT-GALA</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. This link is valid for <b>1 hour</b>.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}"
             style="background:#ec4899;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">
            Reset password
          </a>
        </p>
        <p style="font-size:12px;color:#555">Or paste this link in your browser:<br>${resetUrl}</p>
        <p style="font-size:12px;color:#555">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
