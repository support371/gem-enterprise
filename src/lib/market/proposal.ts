import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const GEM_MARKET_STRIPE_ACCOUNT_ID = "acct_1TkrtxCKnPeVL2Jw";
export const GEM_MARKET_STRIPE_MODE = "live" as const;
export const GEM_MARKET_PAYMENT_LINK_ID = "plink_1UAeuoCKnPeVL2JwrLMswd31";
export const GEM_MARKET_PAYMENT_LINK_URL = "https://buy.stripe.com/eVqfZgeQ58DX9wC7I9b3q00";

const proposalPayloadSchema = z.object({
  v: z.literal(1),
  intakeId: z.string().min(1).max(128),
  publicId: z.string().min(1).max(160),
  exp: z.number().int().positive(),
});

export type ProposalTokenPayload = z.infer<typeof proposalPayloadSchema>;

export type MarketPaymentReadiness = {
  proposalSigningReady: boolean;
  stripeWebhookReady: boolean;
  stripeAccountPinned: boolean;
  stripeAccountVerified: boolean;
  stripeMode: "live";
  paymentLinkPinned: boolean;
  checkoutReady: boolean;
  blockers: string[];
};

type MarketEnvironment = Record<string, string | undefined>;

function proposalSecretFromEnv(env: MarketEnvironment) {
  const dedicated = env.MARKET_PROPOSAL_SECRET?.trim();
  if (dedicated && dedicated.length >= 32) return dedicated;

  const jwtSecret = env.JWT_SECRET?.trim();
  if (!jwtSecret || jwtSecret.length < 32) return null;

  return createHmac("sha256", jwtSecret)
    .update("gem-market-proposal-signing-v1")
    .digest("hex");
}

function proposalSecret() {
  return proposalSecretFromEnv(process.env);
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
    throw new Error(
      "Proposal signing requires MARKET_PROPOSAL_SECRET or JWT_SECRET with at least 32 characters.",
    );
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
  env: MarketEnvironment = process.env,
): MarketPaymentReadiness {
  const proposalSigningReady = Boolean(proposalSecretFromEnv(env));
  const stripeWebhookReady = Boolean(env.GEM_STRIPE_WEBHOOK_SECRET?.trim());
  const stripeAccountPinned = true;
  const stripeAccountVerified = true;
  const stripeMode = GEM_MARKET_STRIPE_MODE;
  const paymentLinkPinned = true;

  const blockers: string[] = [];
  if (!proposalSigningReady) {
    blockers.push(
      "Proposal signing is unavailable. Configure JWT_SECRET or MARKET_PROPOSAL_SECRET with at least 32 characters.",
    );
  }
  if (!stripeWebhookReady) blockers.push("GEM_STRIPE_WEBHOOK_SECRET is not configured.");

  const configuredAccount = env.GEM_STRIPE_ACCOUNT_ID?.trim();
  if (configuredAccount && configuredAccount !== GEM_MARKET_STRIPE_ACCOUNT_ID) {
    blockers.push("GEM_STRIPE_ACCOUNT_ID conflicts with the authorized live merchant account.");
  }
  const configuredMode = env.GEM_STRIPE_MODE?.trim();
  if (configuredMode && configuredMode !== GEM_MARKET_STRIPE_MODE) {
    blockers.push("GEM_STRIPE_MODE conflicts with the authorized live merchant mode.");
  }
  if (
    env.GEM_STRIPE_ACCOUNT_VERIFIED !== undefined &&
    env.GEM_STRIPE_ACCOUNT_VERIFIED !== "true"
  ) {
    blockers.push("GEM_STRIPE_ACCOUNT_VERIFIED conflicts with the authorized merchant record.");
  }
  if (env.VERCEL_ENV !== "production") {
    blockers.push("Live market checkout is available only in production.");
  }

  return {
    proposalSigningReady,
    stripeWebhookReady,
    stripeAccountPinned,
    stripeAccountVerified,
    stripeMode,
    paymentLinkPinned,
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
