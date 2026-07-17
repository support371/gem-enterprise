import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const transportMocks = vi.hoisted(() => ({
  verify: vi.fn(),
  sendMail: vi.fn(),
  close: vi.fn(),
}));

const nodemailerMocks = vi.hoisted(() => ({
  createTransport: vi.fn(() => transportMocks),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: nodemailerMocks.createTransport,
  },
}));

import {
  getMailDeliveryReadiness,
  sendMail,
  verifyMailTransport,
} from "@/lib/mail/send";

const MAIL_ENVIRONMENT_VARIABLES = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "EMAIL_FROM",
  "MAIL_FROM",
  "REPLY_TO_EMAIL",
  "GEM_OWNER_EMAIL",
] as const;

function clearSmtpEnvironment() {
  for (const name of MAIL_ENVIRONMENT_VARIABLES) {
    vi.stubEnv(name, "");
  }
}

function configureSmtp() {
  vi.stubEnv("SMTP_HOST", "smtp.provider.example");
  vi.stubEnv("SMTP_PORT", "587");
  vi.stubEnv("SMTP_SECURE", "false");
  vi.stubEnv("SMTP_USER", "smtp-user");
  vi.stubEnv("SMTP_PASS", "smtp-password-that-must-never-be-returned");
  vi.stubEnv(
    "SMTP_FROM",
    "GEM Enterprise <no-reply@gemcybersecurityassist.com>",
  );
  vi.stubEnv("REPLY_TO_EMAIL", "admin@gemcybersecurityassist.com");
}

describe("SMTP delivery readiness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSmtpEnvironment();
    transportMocks.verify.mockResolvedValue(true);
    transportMocks.sendMail.mockResolvedValue({
      accepted: ["admin@gemcybersecurityassist.com"],
      rejected: [],
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports missing canonical variables without exposing values", () => {
    const readiness = getMailDeliveryReadiness();

    expect(readiness.configured).toBe(false);
    expect(readiness.missing).toEqual(
      expect.arrayContaining([
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
        "SMTP_FROM",
        "REPLY_TO_EMAIL",
      ]),
    );
    expect(JSON.stringify(readiness)).not.toContain("smtp-password");
  });

  it("accepts a complete STARTTLS configuration", () => {
    configureSmtp();

    expect(getMailDeliveryReadiness()).toEqual({
      configured: true,
      missing: [],
      portValid: true,
      secureSettingValid: true,
      senderConfigured: true,
      replyToConfigured: true,
      transportSecurity: "starttls",
    });
  });

  it("fails closed for malformed port or secure settings", () => {
    configureSmtp();
    vi.stubEnv("SMTP_PORT", "70000");
    vi.stubEnv("SMTP_SECURE", "sometimes");

    const readiness = getMailDeliveryReadiness();
    expect(readiness.configured).toBe(false);
    expect(readiness.portValid).toBe(false);
    expect(readiness.secureSettingValid).toBe(false);
    expect(readiness.transportSecurity).toBe("invalid");
  });

  it("verifies the SMTP handshake without sending a message", async () => {
    configureSmtp();

    const result = await verifyMailTransport();

    expect(result).toMatchObject({ ok: true, code: "SMTP_VERIFIED" });
    expect(transportMocks.verify).toHaveBeenCalledOnce();
    expect(transportMocks.sendMail).not.toHaveBeenCalled();
    expect(transportMocks.close).toHaveBeenCalledOnce();
    expect(JSON.stringify(result)).not.toContain(process.env.SMTP_PASS);
  });

  it("maps authentication failure to a safe code", async () => {
    configureSmtp();
    transportMocks.verify.mockRejectedValue({ code: "EAUTH" });

    const result = await verifyMailTransport();

    expect(result).toMatchObject({ ok: false, code: "SMTP_AUTH_FAILED" });
    expect(JSON.stringify(result)).not.toContain(process.env.SMTP_USER);
    expect(JSON.stringify(result)).not.toContain(process.env.SMTP_PASS);
  });

  it("sends through the validated transport and returns only counts", async () => {
    configureSmtp();

    const result = await sendMail({
      to: "admin@gemcybersecurityassist.com",
      subject: "Controlled test",
      text: "Controlled message",
    });

    expect(result).toEqual({
      sent: true,
      skipped: false,
      acceptedCount: 1,
      rejectedCount: 0,
    });
    expect(transportMocks.sendMail).toHaveBeenCalledOnce();
    expect(transportMocks.close).toHaveBeenCalledOnce();
    expect(JSON.stringify(result)).not.toContain(process.env.SMTP_PASS);
  });
});
