import { createHmac } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const intakeGatewayActions = ["list", "get", "update", "convert"] as const;
export type IntakeGatewayAction = (typeof intakeGatewayActions)[number];

const ISSUER = "gem-enterprise";
const AUDIENCE = "gem-intake-gateway";
const PURPOSE = "intake_gateway_capability";
const MAX_TTL_SECONDS = 120;

function signingKey(): Uint8Array {
  const source = process.env.GEM_AGENT_API_KEY?.trim();
  if (!source || source.length < 32) {
    throw new Error("GEM_AGENT_API_KEY is required for privileged intake gateway operations.");
  }
  const derived = createHmac("sha256", source)
    .update("gem-intake-gateway-capability-v1")
    .digest("hex");
  return new TextEncoder().encode(derived);
}

export type IntakeGatewayCapabilityClaims = {
  action: IntakeGatewayAction;
  intakeId: string | null;
};

export async function createIntakeGatewayCapability(input: {
  action: IntakeGatewayAction;
  intakeId?: string | null;
  ttlSeconds?: number;
}): Promise<string> {
  const ttl = Math.min(Math.max(input.ttlSeconds ?? 60, 15), MAX_TTL_SECONDS);
  return new SignJWT({
    purpose: PURPOSE,
    action: input.action,
    intakeId: input.intakeId?.trim() || null,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(signingKey());
}

export async function verifyIntakeGatewayCapability(
  token: string,
): Promise<IntakeGatewayCapabilityClaims | null> {
  try {
    const { payload } = await jwtVerify(token, signingKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (payload.purpose !== PURPOSE) return null;
    if (
      typeof payload.action !== "string" ||
      !intakeGatewayActions.includes(payload.action as IntakeGatewayAction)
    ) {
      return null;
    }
    if (payload.intakeId !== null && typeof payload.intakeId !== "string") return null;
    return {
      action: payload.action as IntakeGatewayAction,
      intakeId: typeof payload.intakeId === "string" ? payload.intakeId : null,
    };
  } catch {
    return null;
  }
}
