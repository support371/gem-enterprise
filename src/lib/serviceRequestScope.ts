export type ServiceRequestScopeResolution<TWorkspace extends { id: string }> =
  | {
      kind: "personal";
      requestedWorkspaceId: null;
      workspace: null;
    }
  | {
      kind: "workspace";
      requestedWorkspaceId: string;
      workspace: TWorkspace;
    }
  | {
      kind: "denied";
      requestedWorkspaceId: string;
      workspace: null;
    };

export function resolveServiceRequestScope<TWorkspace extends { id: string }>(
  accessibleWorkspaces: readonly TWorkspace[],
  requestedWorkspaceId?: string | null,
): ServiceRequestScopeResolution<TWorkspace> {
  const normalizedWorkspaceId = requestedWorkspaceId?.trim() || null;

  if (!normalizedWorkspaceId) {
    return {
      kind: "personal",
      requestedWorkspaceId: null,
      workspace: null,
    };
  }

  const workspace =
    accessibleWorkspaces.find((candidate) => candidate.id === normalizedWorkspaceId) ?? null;

  if (!workspace) {
    return {
      kind: "denied",
      requestedWorkspaceId: normalizedWorkspaceId,
      workspace: null,
    };
  }

  return {
    kind: "workspace",
    requestedWorkspaceId: normalizedWorkspaceId,
    workspace,
  };
}
