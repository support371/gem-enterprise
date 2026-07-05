import crypto from "node:crypto";
import { TokMetricError } from "@/lib/tokmetric/security";
import { type TokMetricConnectorProvider } from "./config";

export interface OAuthStatePayload {
  workspaceId: string;
  provider: TokMetricConnectorProvider;
  environment: "sandbox" | "production";
  codeVerifier: string;
  nonce: string;
  createdAt: number;
  actorId: string;
}

function signingKey() {
  const material = process.env.JWT_SECRET || process.env.TOKMETRIC_TOKEN_ENCRYPTION_KEY || "tokmetric-dev-state-key";
  return crypto.createHash("sha256").update(material).digest();
}

export function encodeOAuthState(payload: OAuthStatePayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", signingKey()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function decodeOAuthState(state: string): OAuthStatePayload {
  const [body, sig] = state.split(".");
  if (!body || !sig) throw new TokMetricError(401, "OAUTH_STATE_INVALID", "OAuth state is invalid.");
  const expected = crypto.createHmac("sha256", signingKey()).update(body).digest("base64url");
  const actual = Buffer.from(sig);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !crypto.timingSafeEqual(actual, wanted)) throw new TokMetricError(401, "OAUTH_STATE_MISMATCH", "OAuth state validation failed.");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OAuthStatePayload;
  if (Date.now() - payload.createdAt > 10 * 60 * 1000) throw new TokMetricError(401, "OAUTH_STATE_EXPIRED", "OAuth state expired.");
  return payload;
}
