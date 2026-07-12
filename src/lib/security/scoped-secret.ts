import { createHmac } from "node:crypto";

export type ScopedSecretSource = "explicit" | "derived" | "missing";

const MIN_SECRET_LENGTH = 32;
const DERIVATION_CONTEXT = "gem-enterprise-service-secret-v1";

function configured(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function getScopedServerSecret(
  explicitEnvironmentName: string,
  scope: string,
): { value: string; source: ScopedSecretSource } {
  const explicit = configured(explicitEnvironmentName);
  if (explicit.length >= MIN_SECRET_LENGTH) {
    return { value: explicit, source: "explicit" };
  }

  const root = configured("JWT_SECRET");
  if (root.length < MIN_SECRET_LENGTH) {
    return { value: "", source: "missing" };
  }

  const value = createHmac("sha256", root)
    .update(`${DERIVATION_CONTEXT}:${scope}`)
    .digest("base64url");

  return { value, source: "derived" };
}

export function hasStrongRootSecret() {
  return configured("JWT_SECRET").length >= MIN_SECRET_LENGTH;
}
