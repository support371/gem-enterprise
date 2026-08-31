import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const proposalPayloadSchema = z.object({
  v: z.literal(1),
  intakeId: z.string().min(1).max(128),
  publicId: z.string().min(1).max(160),
  exp: z.number().int().positive(),
});

export type ProposalTokenPayload = z.infer<typeof proposalPayloadSchema>;

export type MarketPaymentReadiness = {
  proposalSigningReady: boolean;
  stripeSecretReady: boolean;
  stripeWebhookReady: boolean;
  stripeAccountPinned: boolean;
  stripeAccountVerified: boolean;
  stripeMode: "test" | "live" | null;
  checkoutReady: boolean;
  blockers: string[];
};

function proposalSecret() {
  return process.env.MARKET_PROPOSAL_SECRET?.trim() || null;
}

function signatureFor(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`gem-market-proposal-v1.${encodedPayload}`)
    .digest("base64url");
}

export function createProposalToken(
  input: { intakeId: string; publicId: string; ttlSeconds?: number },
  secretOverride?: string,
) {
  const secret = secretOverride?.trim() || proposalSecret();
  if (!secret || secret.length < 32) {
    throw new Error("MARKET_PROPOSAL_SECRET must contain at least 32 characters.");
  }

  const payload: ProposalTokenPayload = {
    v: 1,
    intakeId: input.intakeId,
    publicId: input.publicId,
    exp: Math.floor(Date.now() / 1000) + Math.max(300, input.ttlSeconds ?? 7 * 24 * 60 * 60),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encodedPayload}.${signatureFor(encodedPayload, secret)}`;
}

export function verifyProposalToken(token: string, secretOverride?: string): ProposalTokenPayload | null {
  const secret = secretOverride?.trim() || proposalSecret();
  if (!secret || secret.length < 32) return null;

  const [encodedPayload, suppliedSignature, extra] = token.split(".");
  if (!encodedPayload || !suppliedSignature || extra) return null;

  const expectedSignature = signatureFor(encodedPayload, secret);
  const supplied = Buffer.from(suppliedSignature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const parsed = proposalPayloadSchema.safeParse(
      JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")),
    );
    if (!parsed.success) return null;
    if (parsed.data.exp <= Math.floor(Date.now() / 1000)) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function getMarketPaymentReadiness(
  env: NodeJS.ProcessEnv = process.env,
): MarketPaymentReadiness {
  const proposalSigningReady = (env.MARKET_PROPOSAL_SECRET?.trim().length ?? 0) >= 32;
  const stripeSecretReady = Boolean(env.GEM_STRIPE_SECRET_KEY?.trim());
  const stripeWebhookReady = Boolean(env.GEM_STRIPE_WEBHOOK_SECRET?.trim());
  const stripeAccountPinned = Boolean(env.GEM_STRIPE_ACCOUNT_ID?.trim());
  const stripeAccountVerified = env.GEM_STRIPE_ACCOUNT_VERIFIED === "true";
  const stripeMode = env.GEM_STRIPE_MODE === "live" || env.GEM_STRIPE_MODE === "test"
    ? env.GEM_STRIPE_MODE
    : null;

  const blockers: string[] = [];
  if (!proposalSigningReady) blockers.push("MARKET_PROPOSAL_SECRET is not configured.");
  if (!stripeSecretReady) blockers.push("GEM_STRIPE_SECRET_KEY is not configured.");
  if (!stripeWebhookReady) blockers.push("GEM_STRIPE_WEBHOOK_SECRET is not configured.");
  if (!stripeAccountPinned) blockers.push("GEM_STRIPE_ACCOUNT_ID is not configured.");
  if (!stripeAccountVerified) blockers.push("The configured Stripe account has not been explicitly verified for GEM Enterprise.");
  if (!stripeMode) blockers.push("GEM_STRIPE_MODE must be either test or live.");
  if (env.VERCEL_ENV === "production" && stripeMode !== "live") {
    blockers.push("Production checkout requires GEM_STRIPE_MODE=live.");
  }

  return {
    proposalSigningReady,
    stripeSecretReady,
    stripeWebhookReady,
    stripeAccountPinned,
    stripeAccountVerified,
    stripeMode,
    checkoutReady: blockers.length === 0,
    blockers,
  };
}

export function verifyStripeWebhookSignature(input: {
  payload: string;
  header: string | null;
  secret?: string;
  toleranceSeconds?: number;
  nowSeconds?: number;
}) {
  const secret = input.secret?.trim() || process.env.GEM_STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !input.header) return false;

  const entries = input.header.split(",").map((part) => part.trim());
  const timestamp = entries.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = entries
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;

  const ts = Number(timestamp);
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > (input.toleranceSeconds ?? 300)) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${input.payload}`)
    .digest("hex");

  return signatures.some((signature) => {
    const supplied = Buffer.from(signature, "utf8");
    const target = Buffer.from(expected, "utf8");
    return supplied.length === target.length && timingSafeEqual(supplied, target);
  });
}
