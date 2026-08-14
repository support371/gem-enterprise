import { resolveWorkspaceAccess, type AccessibleWorkspace } from "@/lib/workspaceAccess";

export interface CapitalWorkspaceAccessResult {
  allowed: boolean;
  workspace: AccessibleWorkspace | null;
  code: "ALLOWED" | "WORKSPACE_REQUIRED" | "WORKSPACE_ACCESS_DENIED" | "WORKSPACE_LOCKED";
  reason: string;
}

export async function requireCapitalWorkspaceAccess(
  userId: string,
  workspaceId: string | null | undefined,
): Promise<CapitalWorkspaceAccessResult> {
  const requestedWorkspaceId = workspaceId?.trim() || null;
  if (!requestedWorkspaceId) {
    return {
      allowed: false,
      workspace: null,
      code: "WORKSPACE_REQUIRED",
      reason: "A workspace identifier is required.",
    };
  }

  const resolution = await resolveWorkspaceAccess(userId, requestedWorkspaceId);
  if (resolution.requestedDenied || !resolution.selected) {
    return {
      allowed: false,
      workspace: null,
      code: "WORKSPACE_ACCESS_DENIED",
      reason: "The authenticated user does not have access to the requested workspace.",
    };
  }

  if (resolution.selected.controls.globalEmergencyLock) {
    return {
      allowed: false,
      workspace: resolution.selected,
      code: "WORKSPACE_LOCKED",
      reason: "The workspace global emergency lock is active.",
    };
  }

  return {
    allowed: true,
    workspace: resolution.selected,
    code: "ALLOWED",
    reason: "Workspace access is authorized.",
  };
}
