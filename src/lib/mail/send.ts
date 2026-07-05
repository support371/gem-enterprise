import nodemailer from "nodemailer";

export type MailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function hasMailConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function fromAddress() {
  return process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.MAIL_FROM || "GEM Enterprise <no-reply@gemcybersecurityassist.com>";
}

export async function sendMail(message: MailMessage) {
  if (!hasMailConfig()) {
    console.warn("[mail] SMTP is not configured; message skipped", {
      to: message.to,
      subject: message.subject,
    });
    return { sent: false, skipped: true, reason: "smtp_not_configured" };
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transport.sendMail({
    from: fromAddress(),
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    replyTo: message.replyTo || process.env.REPLY_TO_EMAIL || process.env.GEM_OWNER_EMAIL,
  });

  return { sent: true, skipped: false };
}
