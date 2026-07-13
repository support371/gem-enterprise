import type { AuthRole, SessionPayload } from "@/lib/auth";

export type AccountStatus = "active" | "suspended" | "pending_approval";

export interface AuthoritativeAccountSnapshot {
  id: string;
  email: string;
  role: string;
  status: AccountStatus;
  isActive: boolean;
  organizationId: string | null;
  sessionVersion: number;
}

type AuthoritySuccess = {
  ok: true;
  session: SessionPayload;
  accountStatus: AccountStatus;
  claimsChanged: boolean;
};

type AuthorityFailure = {
  ok: false;
  statusCode: 401 | 403;
  code:
    | "SESSION_ACCOUNT_NOT_FOUND"
    | "SESSION_ACCOUNT_DISABLED"
    | "SESSION_ROLE_INVALID"
    | "SESSION_REVOKED";
  message: string;
};

export type SessionAuthorityResult = AuthoritySuccess | AuthorityFailure;

const AUTH_ROLES: readonly AuthRole[] = [
  "client",
  "analyst",
  "admin",
  "super_admin",
  "internal",
];

function isAuthRole(value: string): value is AuthRole {
  return AUTH_ROLES.includes(value as AuthRole);
}

export function reconcileSessionAuthority(
  claims: SessionPayload,
  account: AuthoritativeAccountSnapshot | null,
): SessionAuthorityResult {
  if (!account || account.id !== claims.userId) {
    return {
      ok: false,
      statusCode: 401,
      code: "SESSION_ACCOUNT_NOT_FOUND",
      message: "The account linked to this session is no longer available.",
    };
  }

  if (!isAuthRole(account.role)) {
    return {
      ok: false,
      statusCode: 403,
      code: "SESSION_ROLE_INVALID",
      message: "The current account role is not recognized.",
    };
  }

  if (!account.isActive || account.status === "suspended") {
    return {
      ok: false,
      statusCode: 403,
      code: "SESSION_ACCOUNT_DISABLED",
      message: "This account is not active.",
    };
  }

  if (
    !Number.isSafeInteger(claims.sessionVersion) ||
    claims.sessionVersion !== account.sessionVersion
  ) {
    return {
      ok: false,
      statusCode: 401,
      code: "SESSION_REVOKED",
      message: "This session is no longer valid. Sign in again.",
    };
  }

  const organizationId = account.organizationId ?? undefined;
  const claimsChanged =
    claims.email !== account.email ||
    claims.role !== account.role ||
    claims.organizationId !== organizationId;

  return {
    ok: true,
    accountStatus: account.status,
    claimsChanged,
    session: {
      ...claims,
      email: account.email,
      role: account.role,
      organizationId,
      sessionVersion: account.sessionVersion,
    },
  };
}
