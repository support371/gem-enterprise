import crypto from "node:crypto";
import { TokMetricError } from "@/lib/tokmetric/security";

function keyFromEnv() {
  const raw = process.env.TOKMETRIC_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new TokMetricError(503, "TOKMETRIC_OAUTH_NOT_CONFIGURED", "TokMetric token encryption is not configured.");
  const decoded = Buffer.from(raw, /^[A-Fa-f0-9]{64}$/.test(raw) ? "hex" : "base64");
  if (decoded.length === 32) return decoded;
  if (process.env.NODE_ENV === "production") throw new TokMetricError(503, "TOKMETRIC_OAUTH_NOT_CONFIGURED", "TokMetric token encryption key must be 32 bytes in production.");
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptCredential(payload: unknown) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyFromEnv(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptCredential<T>(value: string): T {
  const [version, ivRaw, tagRaw, ciphertextRaw] = value.split(".");
  if (version !== "v1" || !ivRaw || !tagRaw || !ciphertextRaw) throw new TokMetricError(500, "CREDENTIAL_DECRYPT_FAILED", "Stored credential could not be read.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyFromEnv(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextRaw, "base64url")), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext) as T;
}

export function createPkcePair() {
  const verifier = crypto.randomBytes(48).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge, method: "S256" as const };
}
