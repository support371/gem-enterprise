import { describe, expect, it } from "vitest";
import {
  getAssignableRolesForActor,
  validateReviewerRoleChange,
} from "@/lib/reviewer-role-policy";

const target = {
  id: "target-1",
  email: "reviewer@example.com",
  role: "client",
  status: "active" as const,
  isActive: true,
  isEmailVerified: true,
};

describe("reviewer role assignment policy", () => {
  it("allows regular admins to assign analyst but not administrator", () => {
    expect(getAssignableRolesForActor("admin")).toEqual(["client", "analyst"]);
    expect(
      validateReviewerRoleChange({
        actorId: "admin-1",
        actorRole: "admin",
        target,
        requestedRole: "analyst",
        confirmEmail: target.email,
        reason: "Assigned for the controlled verification pilot.",
      }),
    ).toEqual({ ok: true });

    expect(
      validateReviewerRoleChange({
        actorId: "admin-1",
        actorRole: "admin",
        target,
        requestedRole: "admin",
        confirmEmail: target.email,
        reason: "Attempted administrator assignment.",
      }),
    ).toMatchObject({ ok: false, code: "ROLE_ASSIGNMENT_FORBIDDEN" });
  });

  it("allows super administrator and internal operators to assign admin", () => {
    expect(getAssignableRolesForActor("super_admin")).toContain("admin");
    expect(getAssignableRolesForActor("internal")).toContain("admin");
  });

  it("rejects self-role changes", () => {
    expect(
      validateReviewerRoleChange({
        actorId: target.id,
        actorRole: "admin",
        target,
        requestedRole: "analyst",
        confirmEmail: target.email,
        reason: "Self assignment should not be possible.",
      }),
    ).toMatchObject({ ok: false, code: "SELF_ROLE_CHANGE_FORBIDDEN" });
  });

  it("requires exact target-email confirmation and a meaningful reason", () => {
    expect(
      validateReviewerRoleChange({
        actorId: "admin-1",
        actorRole: "admin",
        target,
        requestedRole: "analyst",
        confirmEmail: "wrong@example.com",
        reason: "Valid reason for assignment.",
      }),
    ).toMatchObject({ ok: false, code: "ROLE_CONFIRMATION_MISMATCH" });

    expect(
      validateReviewerRoleChange({
        actorId: "admin-1",
        actorRole: "admin",
        target,
        requestedRole: "analyst",
        confirmEmail: target.email,
        reason: "short",
      }),
    ).toMatchObject({ ok: false, code: "ROLE_CHANGE_REASON_REQUIRED" });
  });

  it("requires an active, email-verified account for reviewer promotion", () => {
    expect(
      validateReviewerRoleChange({
        actorId: "admin-1",
        actorRole: "admin",
        target: { ...target, isEmailVerified: false },
        requestedRole: "analyst",
        confirmEmail: target.email,
        reason: "Reviewer candidate has not verified email.",
      }),
    ).toMatchObject({ ok: false, code: "REVIEWER_ACCOUNT_NOT_ELIGIBLE" });
  });

  it("keeps super administrator and internal roles out-of-band", () => {
    expect(
      validateReviewerRoleChange({
        actorId: "super-1",
        actorRole: "super_admin",
        target: { ...target, role: "internal" },
        requestedRole: "client",
        confirmEmail: target.email,
        reason: "Attempt to change a protected operator role.",
      }),
    ).toMatchObject({ ok: false, code: "PRIVILEGED_ROLE_OUT_OF_BAND_ONLY" });
  });
});
