import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const ADMIN_ACCESS_EMAIL = "admin@gemcybersecurityassist.com";
const ACCESS_TOKEN_PATTERN = /^(aar_[a-f0-9]{32})\.([A-Za-z0-9_-]{48,128})$/;

interface AdminAccessTokenRow {
  id: string;
  userId: string;
}

interface AdminAccessUserRow {
  id: string;
  email: string;
}

export interface AdminAccessConsumptionResult {
  ok: true;
  email: string;
  loginPath: "/client-login";
}

export class AdminAccessConsumptionError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminAccessConsumptionError";
  }
}

function parseBoundRequestId(accessToken: string, expectedRequestId: string): string {
  const match = ACCESS_TOKEN_PATTERN.exec(accessToken);
  if (!match || match[1] !== expectedRequestId) {
    throw new AdminAccessConsumptionError(
      400,
      "INVALID_TOKEN",
      "Invalid or expired setup capability.",
    );
  }
  return match[1];
}

function validatePassword(password: string): void {
  const strong =
    password.length >= 16 &&
    password.length <= 256 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  if (!strong) {
    throw new AdminAccessConsumptionError(
      400,
      "INVALID_PASSWORD",
      "Password does not meet the administrator password policy.",
    );
  }
}

function databaseErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

export async function consumeAdminAccessToken(
  accessToken: string,
  password: string,
  expectedRequestId: string,
): Promise<AdminAccessConsumptionResult> {
  const requestId = parseBoundRequestId(accessToken, expectedRequestId);
  validatePassword(password);

  const tokenHash = createHash("sha256").update(accessToken).digest("hex");
  const passwordHash = await bcrypt.hash(password, 12);
  const auditId = randomUUID();

  try {
    const result = await db.$transaction(
      async (transaction) => {
        const tokenRows = await transaction.$queryRaw<AdminAccessTokenRow[]>(
          Prisma.sql`
            SELECT
              id,
              user_id AS "userId"
            FROM public.admin_access_tokens
            WHERE token_hash = ${tokenHash}
              AND request_id = ${requestId}
              AND used_at IS NULL
              AND expires_at > NOW()
            FOR UPDATE
          `,
        );
        const token = tokenRows[0];
        if (!token) return null;

        const userRows = await transaction.$queryRaw<AdminAccessUserRow[]>(
          Prisma.sql`
            SELECT id, email
            FROM public.users
            WHERE id = ${token.userId}
              AND email = ${ADMIN_ACCESS_EMAIL}
              AND role IN ('admin', 'super_admin', 'internal')
              AND status = 'active'
              AND "isActive" = true
              AND "isEmailVerified" = true
            FOR UPDATE
          `,
        );
        const user = userRows[0];
        if (!user) return null;

        await transaction.$executeRaw(
          Prisma.sql`
            UPDATE public.users
            SET
              "passwordHash" = ${passwordHash},
              "updatedAt" = NOW()
            WHERE id = ${user.id}
          `,
        );

        const consumedRows = await transaction.$executeRaw(
          Prisma.sql`
            UPDATE public.admin_access_tokens
            SET
              used_at = NOW(),
              run_secret = NULL
            WHERE id = ${token.id}
              AND used_at IS NULL
          `,
        );
        if (consumedRows !== 1) {
          throw new AdminAccessConsumptionError(
            409,
            "TOKEN_CONSUMPTION_CONFLICT",
            "Administrator setup capability was already consumed.",
          );
        }

        await transaction.$executeRaw(
          Prisma.sql`
            DELETE FROM public.admin_access_tokens
            WHERE user_id = ${user.id}
              AND id <> ${token.id}
          `,
        );

        await transaction.$executeRaw(
          Prisma.sql`
            INSERT INTO public.audit_logs (
              id,
              "userId",
              action,
              resource,
              "resourceId",
              metadata,
              "createdAt"
            ) VALUES (
              ${auditId},
              ${user.id},
              'password_change',
              'user',
              ${user.id},
              CAST(${JSON.stringify({
                flow: "one_time_admin_access",
                tokenId: token.id,
                requestId,
                boundary: "nextjs_direct_database",
              })} AS jsonb),
              NOW()
            )
          `,
        );

        return {
          ok: true,
          email: user.email,
          loginPath: "/client-login",
        } as const;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (!result) {
      throw new AdminAccessConsumptionError(
        400,
        "INVALID_TOKEN",
        "Invalid or expired setup capability.",
      );
    }

    return result;
  } catch (error) {
    if (error instanceof AdminAccessConsumptionError) throw error;

    const code = databaseErrorCode(error);
    if (code === "P2034" || code === "40001" || code === "40P01") {
      throw new AdminAccessConsumptionError(
        409,
        "TOKEN_CONSUMPTION_CONFLICT",
        "Administrator setup capability could not be consumed safely.",
      );
    }

    throw new AdminAccessConsumptionError(
      503,
      "ADMIN_ACCESS_DATABASE_UNAVAILABLE",
      "Administrator setup is unavailable.",
    );
  }
}
