import { createHash, createHmac, randomBytes } from "node:crypto";
import { z } from "zod";

export const NEWSLETTER_CONSENT_VERSION = "2026-07-28-v1";
export const NEWSLETTER_SOURCE = "gem_newsletter_page";

export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(254),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
  website: z.string().max(500).optional(),
});

export type NewsletterSubscribeInput = z.infer<
  typeof newsletterSubscribeSchema
>;

export function normalizeNewsletterEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createNewsletterToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashNewsletterToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function hashNewsletterIp(ipAddress: string): string | null {
  const salt = process.env.NEWSLETTER_PRIVACY_SALT?.trim();
  if (!salt || !ipAddress || ipAddress === "unknown") return null;
  return createHmac("sha256", salt).update(ipAddress, "utf8").digest("hex");
}

export function getNewsletterAppUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "https://www.gemcybersecurityassist.com";

  return configured.replace(/\/$/, "");
}

export function buildNewsletterConfirmationUrl(token: string): string {
  const url = new URL("/api/newsletter/confirm", getNewsletterAppUrl());
  url.searchParams.set("token", token);
  return url.toString();
}
