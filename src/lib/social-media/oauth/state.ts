import crypto from "node:crypto";
import { TokMetricError } from "@/lib/tokmetric/security";
import { parseSocialOAuthProvider, type SocialOAuthProvider } from "./config";

export interface SocialOAuthStatePayload {
  nonce: string;
  workspaceId: string;
  actorId: string;
  provider: SocialOAuthProvider;
  createdAt: number;
}

function stateSigningKey() {
  const material =
    process.env.SOCIAL_OAUTH_STATE_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    process.env.SOCIAL_TOKEN_ENCRYPTION_KEY?.trim();
  if (!material && process.env.NODE_ENV === "production") {
    throw new TokMetricError(
      503,
      "SOCIAL_OAUTH_NOT_CONFIGURED",
      "Social OAuth state signing is not configured.",
    );
  }
  return crypto
    .createHash("sha256")
    .update("gem-social-oauth-state:v1:")
    .update(material || "gem-social-oauth-development-state")
    .digest();
}

export function encodeSocialOAuthState(payload: SocialOAuthStatePayload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", stateSigningKey())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function decodeSocialOAuthState(value: string): SocialOAuthStatePayload {
  const [body, signature] = value.split(".");
  if (!body || !signature) {
    throw new TokMetricError(401, "SOCIAL_OAUTH_STATE_INVALID", "Social OAuth state is invalid.");
  }
  const expected = crypto
    .createHmac("sha256", stateSigningKey())
    .update(body)
    .digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new TokMetricError(
      401,
      "SOCIAL_OAUTH_STATE_MISMATCH",
      "Social OAuth state validation failed.",
    );
  }

  let parsed: Partial<SocialOAuthStatePayload>;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<SocialOAuthStatePayload>;
  } catch {
    throw new TokMetricError(401, "SOCIAL_OAUTH_STATE_INVALID", "Social OAuth state is invalid.");
  }

  if (
    !parsed.nonce ||
    !parsed.workspaceId ||
    !parsed.actorId ||
    !parsed.provider ||
    typeof parsed.createdAt !== "number"
  ) {
    throw new TokMetricError(401, "SOCIAL_OAUTH_STATE_INVALID", "Social OAuth state is incomplete.");
  }
  if (Date.now() - parsed.createdAt > 10 * 60 * 1000 || parsed.createdAt > Date.now() + 60_000) {
    throw new TokMetricError(401, "SOCIAL_OAUTH_STATE_EXPIRED", "Social OAuth state expired.");
  }

  return {
    nonce: parsed.nonce,
    workspaceId: parsed.workspaceId,
    actorId: parsed.actorId,
    provider: parseSocialOAuthProvider(parsed.provider),
    createdAt: parsed.createdAt,
  };
}
