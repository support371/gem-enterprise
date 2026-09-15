export const customerLifecycleStates = ["ACTIVE", "AT_RISK", "PAUSED", "COMPLETED", "DORMANT"] as const;
export const customerHealthStatuses = ["UNKNOWN", "HEALTHY", "WATCH", "AT_RISK"] as const;
export const customerOutcomeStatuses = ["NOT_REVIEWED", "IN_PROGRESS", "ACHIEVED", "PARTIAL", "NOT_ACHIEVED"] as const;
export const customerSuccessActionTypes = ["FOLLOW_UP", "OUTCOME", "EXPANSION", "RENEWAL", "REFERRAL", "WIN_BACK"] as const;
export const customerSuccessActionStatuses = ["PLANNED", "OPEN", "WAITING", "COMPLETED", "CANCELLED"] as const;

export type CustomerLifecycleState = (typeof customerLifecycleStates)[number];
export type CustomerHealthStatus = (typeof customerHealthStatuses)[number];
export type CustomerOutcomeStatus = (typeof customerOutcomeStatuses)[number];
export type CustomerSuccessActionType = (typeof customerSuccessActionTypes)[number];
export type CustomerSuccessActionStatus = (typeof customerSuccessActionStatuses)[number];

export interface CustomerSuccessProfileDto {
  id: string;
  workspaceId: string;
  projectId: string | null;
  ownerUserId: string | null;
  lifecycleState: CustomerLifecycleState;
  healthStatus: CustomerHealthStatus;
  outcomeStatus: CustomerOutcomeStatus;
  satisfactionScore: number | null;
  outcomeSummary: string | null;
  lastReviewAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceName: string;
  organizationName: string;
  projectName: string | null;
}

export interface CustomerSuccessActionDto {
  id: string;
  profileId: string;
  workspaceId: string;
  projectId: string | null;
  createdById: string | null;
  actionType: CustomerSuccessActionType;
  status: CustomerSuccessActionStatus;
  title: string;
  notes: string | null;
  dueAt: string | null;
  completedAt: string | null;
  evidence: unknown;
  createdAt: string;
  updatedAt: string;
}
