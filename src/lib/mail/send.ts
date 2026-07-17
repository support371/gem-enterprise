import nodemailer from "nodemailer";

export type MailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

const REQUIRED_SMTP_VARIABLES = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

export type MailDeliveryReadiness = {
  configured: boolean;
  missing: string[];
  portValid: boolean;
  secureSettingValid: boolean;
  senderConfigured: boolean;
  replyToConfigured: boolean;
  transportSecurity: "implicit_tls" | "starttls" | "invalid" | "unknown";
};

export type MailTransportVerification =
  | {
      ok: true;
      code: "SMTP_VERIFIED";
      readiness: MailDeliveryReadiness;
    }
  | {
      ok: false;
      code:
        | "SMTP_NOT_CONFIGURED"
        | "SMTP_AUTH_FAILED"
        | "SMTP_CONNECTION_FAILED"
        | "SMTP_VERIFY_FAILED";
      readiness: MailDeliveryReadiness;
    };

function configuredValue(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function smtpPort(): number {
  return Number(process.env.SMTP_PORT);
}

export function getMailDeliveryReadiness(): MailDeliveryReadiness {
  const missing = REQUIRED_SMTP_VARIABLES.filter(
    (name) => !configuredValue(name),
  ) as string[];
  const port = smtpPort();
  const portValid = Number.isInteger(port) && port > 0 && port <= 65_535;
  const secureSetting = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secureSettingValid =
    !secureSetting || secureSetting === "true" || secureSetting === "false";
  const senderConfigured = Boolean(
    process.env.SMTP_FROM?.trim() ||
      process.env.EMAIL_FROM?.trim() ||
      process.env.MAIL_FROM?.trim(),
  );
  const replyToConfigured = Boolean(
    process.env.REPLY_TO_EMAIL?.trim() || process.env.GEM_OWNER_EMAIL?.trim(),
  );

  if (!senderConfigured) missing.push("SMTP_FROM");
  if (!replyToConfigured) missing.push("REPLY_TO_EMAIL");

  const transportSecurity = !portValid
    ? "invalid"
    : process.env.SMTP_PORT === "465" || secureSetting === "true"
      ? "implicit_tls"
      : "starttls";

  return {
    configured:
      missing.length === 0 && portValid && secureSettingValid,
    missing: [...new Set(missing)],
    portValid,
    secureSettingValid,
    senderConfigured,
    replyToConfigured,
    transportSecurity: configuredValue("SMTP_PORT")
      ? transportSecurity
      : "unknown",
  };
}

export function isMailDeliveryConfigured() {
  return getMailDeliveryReadiness().configured;
}

function fromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    process.env.MAIL_FROM ||
    "GEM Enterprise <no-reply@gemcybersecurityassist.com>"
  );
}

function createMailTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port: smtpPort(),
    secure:
      process.env.SMTP_SECURE?.trim().toLowerCase() === "true" ||
      process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });
}

function verificationFailureCode(
  error: unknown,
): Exclude<MailTransportVerification, { ok: true }>["code"] {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  if (code === "EAUTH") return "SMTP_AUTH_FAILED";
  if (["ETIMEDOUT", "ESOCKET", "ECONNECTION", "ECONNREFUSED"].includes(code)) {
    return "SMTP_CONNECTION_FAILED";
  }
  return "SMTP_VERIFY_FAILED";
}

export async function verifyMailTransport(): Promise<MailTransportVerification> {
  const readiness = getMailDeliveryReadiness();
  if (!readiness.configured) {
    return { ok: false, code: "SMTP_NOT_CONFIGURED", readiness };
  }

  const transport = createMailTransport();
  try {
    await transport.verify();
    return { ok: true, code: "SMTP_VERIFIED", readiness };
  } catch (error) {
    return { ok: false, code: verificationFailureCode(error), readiness };
  } finally {
    transport.close();
  }
}

export async function sendMail(message: MailMessage) {
  const readiness = getMailDeliveryReadiness();
  if (!readiness.configured) {
    console.warn("[mail] SMTP is not configured; message skipped", {
      recipientCount: Array.isArray(message.to) ? message.to.length : 1,
      missing: readiness.missing,
    });
    return { sent: false, skipped: true, reason: "smtp_not_configured" };
  }

  const transport = createMailTransport();
  try {
    const result = await transport.sendMail({
      from: fromAddress(),
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo:
        message.replyTo ||
        process.env.REPLY_TO_EMAIL ||
        process.env.GEM_OWNER_EMAIL,
    });

    return {
      sent: result.accepted.length > 0,
      skipped: false,
      acceptedCount: result.accepted.length,
      rejectedCount: result.rejected.length,
    };
  } finally {
    transport.close();
  }
}
