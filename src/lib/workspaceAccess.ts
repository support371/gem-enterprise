import { db } from "@/lib/db";

export interface AccessibleWorkspace {
  membershipId: string;
  id: string;
  name: string;
  slug: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    billingPlan: string | null;
  };
  role: {
    name: string;
    description: string | null;
  };
  permissions: Array<{
    action: string;
    scope: string;
  }>;
  counts: {
    members: number;
    connectors: number;
    approvalRecords: number;
  };
  controls: {
    globalEmergencyLock: boolean;
    publishingDisabled: boolean;
    advertisingDisabled: boolean;
    shopWriteDisabled: boolean;
    connectorDisabled: boolean;
  };
}

export interface WorkspaceAccessResolution {
  workspaces: AccessibleWorkspace[];
  selected: AccessibleWorkspace | null;
  requestedWorkspaceId: string | null;
  requestedDenied: boolean;
}

export async function listAccessibleWorkspaces(userId: string): Promise<AccessibleWorkspace[]> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) return [];

  const memberships = await db.workspaceMember.findMany({
    where: {
      userId: normalizedUserId,
      status: "active",
    },
    select: {
      id: true,
      role: {
        select: {
          name: true,
          description: true,
          permissions: {
            select: {
              action: true,
              scope: true,
            },
          },
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          globalEmergencyLock: true,
          publishingDisabled: true,
          advertisingDisabled: true,
          shopWriteDisabled: true,
          connectorDisabled: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              billingPlan: true,
            },
          },
          _count: {
            select: {
              members: true,
              connectors: true,
              approvalRequests: true,
            },
          },
        },
      },
    },
  });

  return memberships
    .filter((membership) => membership.workspace.organization.status === "active")
    .map((membership) => ({
      membershipId: membership.id,
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      organization: {
        id: membership.workspace.organization.id,
        name: membership.workspace.organization.name,
        slug: membership.workspace.organization.slug,
        billingPlan: membership.workspace.organization.billingPlan,
      },
      role: {
        name: membership.role?.name ?? "Member",
        description: membership.role?.description ?? null,
      },
      permissions: [...(membership.role?.permissions ?? [])].sort((left, right) =>
        `${left.scope}:${left.action}`.localeCompare(`${right.scope}:${right.action}`),
      ),
      counts: {
        members: membership.workspace._count.members,
        connectors: membership.workspace._count.connectors,
        approvalRecords: membership.workspace._count.approvalRequests,
      },
      controls: {
        globalEmergencyLock: membership.workspace.globalEmergencyLock,
        publishingDisabled: membership.workspace.publishingDisabled,
        advertisingDisabled: membership.workspace.advertisingDisabled,
        shopWriteDisabled: membership.workspace.shopWriteDisabled,
        connectorDisabled: membership.workspace.connectorDisabled,
      },
    }))
    .sort((left, right) =>
      `${left.organization.name}:${left.name}`.localeCompare(
        `${right.organization.name}:${right.name}`,
      ),
    );
}

export async function resolveWorkspaceAccess(
  userId: string,
  requestedWorkspaceId?: string | null,
): Promise<WorkspaceAccessResolution> {
  const workspaces = await listAccessibleWorkspaces(userId);
  const normalizedWorkspaceId = requestedWorkspaceId?.trim() || null;
  const selected = normalizedWorkspaceId
    ? workspaces.find((workspace) => workspace.id === normalizedWorkspaceId) ?? null
    : workspaces[0] ?? null;

  return {
    workspaces,
    selected,
    requestedWorkspaceId: normalizedWorkspaceId,
    requestedDenied: Boolean(normalizedWorkspaceId && !selected),
  };
}
