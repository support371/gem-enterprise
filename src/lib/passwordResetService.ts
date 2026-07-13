import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";
import {
  completePasswordRecoveryGateway,
  GatewayRequestError,
  shouldUseSupabaseGateway,
} from "@/lib/supabase-gateway";
import {
  fingerprintPasswordHash,
  passwordFingerprintsMatch,
  verifyPasswordResetToken,
} from "@/lib/passwordReset";

export async function completePasswordReset(token: string, newPassword: string) {
  if (shouldUseSupabaseGateway()) {
    try {
      const result = await completePasswordRecoveryGateway(token, newPassword);
      return {
        ok: true as const,
        userId: result.userId,
        auditRecorded: true as const,
      };
    } catch (error) {
      if (error instanceof GatewayRequestError) {
        const code =
          error.code === "PASSWORD_REUSED"
            ? "password_reused"
            : error.code === "PASSWORD_POLICY_FAILED"
              ? "password_policy_failed"
              : error.statusCode >= 500
                ? "service_unavailable"
                : "invalid_token";
        return { ok: false as const, code };
      }
      return { ok: false as const, code: "service_unavailable" };
    }
  }

  const claims = await verifyPasswordResetToken(token);
  if (!claims) return { ok: false as const, code: "invalid_token" };

  const user = await db.user.findUnique({ where: { id: claims.userId } });
  if (!user || !user.isActive || user.status !== "active" || user.email !== claims.email) {
    return { ok: false as const, code: "invalid_token" };
  }

  const currentFingerprint = fingerprintPasswordHash(user.passwordHash);
  if (!passwordFingerprintsMatch(currentFingerprint, claims.passwordFingerprint)) {
    return { ok: false as const, code: "invalid_token" };
  }

  if (await bcryptjs.compare(newPassword, user.passwordHash)) {
    return { ok: false as const, code: "password_reused" };
  }

  const nextHash = await bcryptjs.hash(newPassword, 12);
  const changed = await db.user.updateMany({
    where: { id: user.id, passwordHash: user.passwordHash },
    data: { passwordHash: nextHash },
  });
  if (changed.count !== 1) return { ok: false as const, code: "invalid_token" };

  return {
    ok: true as const,
    userId: user.id,
    auditRecorded: false as const,
  };
}
