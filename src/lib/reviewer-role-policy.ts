import type { AuthRole } from "@/lib/auth";

export type ApiAssignableRole = "client" | "analyst" | "admin";

export interface ReviewerRoleTarget {
  id: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "pending_approval";
  isActive: boolean;
  isEmailVerified: boolean;
}

export type RolePolicyResult =
  | { ok: true }
  | {
      ok: false;
      statusCode: 400 | 403 | 409;
      code:
        | "ROLE_ASSIGNMENT_FORBIDDEN"
        | "SELF_ROLE_CHANGE_FORBIDDEN"
        | "PRIVILEGED_ROLE_OUT_OF_BAND_ONLY"
        | "ROLE_CONFIRMATION_MISMATCH"
        | "ROLE_CHANGE_REASON_REQUIRED"
        | "REVIEWER_ACCOUNT_NOT_ELIGIBLE"
        | "ROLE_ALREADY_ASSIGNED";
      message: string;
    };

const ADMIN_ASSIGNABLE: readonly ApiAssignableRole[] = ["client", "analyst"];
const ELEVATED_ASSIGNABLE: readonly ApiAssignableRole[] = [
  "client",
  "analyst",
  "admin",
];

export function getAssignableRolesForActor(role: string): ApiAssignableRole[] {
  if (role === "super_admin" || role === "internal") {
    return [...ELEVATED_ASSIGNABLE];
  }
  if (role === "admin") return [...ADMIN_ASSIGNABLE];
  return [];
}

export function validateReviewerRoleChange(input: {
  actorId: string;
  actorRole: string;
  target: ReviewerRoleTarget;
  requestedRole: ApiAssignableRole;
  confirmEmail: string | undefined;
  reason: string | undefined;
}): RolePolicyResult {
  const reason = input.reason?.trim() ?? "";
  const confirmEmail = input.confirmEmail?.trim().toLowerCase() ?? "";

  if (input.actorId === input.target.id) {
    return {
      ok: false,
      statusCode: 403,
      code: "SELF_ROLE_CHANGE_FORBIDDEN",
      message: "You cannot change your own role through this endpoint.",
    };
  }

  if (["super_admin", "internal"].includes(input.target.role)) {
    return {
      ok: false,
      statusCode: 403,
      code: "PRIVILEGED_ROLE_OUT_OF_BAND_ONLY",
      message:
        "Super administrator and internal account roles can only be changed through an out-of-band operator process.",
    };
  }

  if (!getAssignableRolesForActor(input.actorRole).includes(input.requestedRole)) {
    return {
      ok: false,
      statusCode: 403,
      code: "ROLE_ASSIGNMENT_FORBIDDEN",
      message: "Your account cannot assign the requested role.",
    };
  }

  if (confirmEmail !== input.target.email.trim().toLowerCase()) {
    return {
      ok: false,
      statusCode: 400,
      code: "ROLE_CONFIRMATION_MISMATCH",
      message: "The confirmation email does not match the target account.",
    };
  }

  if (reason.length < 10) {
    return {
      ok: false,
      statusCode: 400,
      code: "ROLE_CHANGE_REASON_REQUIRED",
      message: "Provide a role-change reason of at least 10 characters.",
    };
  }

  if (input.target.role === input.requestedRole) {
    return {
      ok: false,
      statusCode: 409,
      code: "ROLE_ALREADY_ASSIGNED",
      message: "The account already has the requested role.",
    };
  }

  if (
    ["analyst", "admin"].includes(input.requestedRole) &&
    (!input.target.isActive ||
      input.target.status !== "active" ||
      !input.target.isEmailVerified)
  ) {
    return {
      ok: false,
      statusCode: 409,
      code: "REVIEWER_ACCOUNT_NOT_ELIGIBLE",
      message:
        "Reviewer and administrator roles require an active, email-verified account in active status.",
    };
  }

  return { ok: true };
}
