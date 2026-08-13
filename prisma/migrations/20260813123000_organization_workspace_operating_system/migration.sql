CREATE TYPE "OrganizationProjectStatus" AS ENUM ('PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "WorkspaceUpdateStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED');

CREATE TABLE "organization_projects" (
  "id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL, "summary" TEXT NOT NULL,
  "status" "OrganizationProjectStatus" NOT NULL DEFAULT 'PLANNED',
  "progress" INTEGER NOT NULL DEFAULT 0, "ownerUserId" TEXT,
  "startDate" TIMESTAMP(3), "targetDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "organization_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workspace_weekly_updates" (
  "id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "projectId" TEXT,
  "authorUserId" TEXT NOT NULL, "reviewedById" TEXT, "weekEnding" TIMESTAMP(3) NOT NULL,
  "accomplishments" TEXT NOT NULL, "inProgress" TEXT NOT NULL, "blockers" TEXT,
  "decisionsNeeded" TEXT, "nextPriorities" TEXT NOT NULL,
  "status" "WorkspaceUpdateStatus" NOT NULL DEFAULT 'DRAFT',
  "submittedAt" TIMESTAMP(3), "reviewedAt" TIMESTAMP(3), "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workspace_weekly_updates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organization_projects_workspaceId_slug_key" ON "organization_projects"("workspaceId", "slug");
CREATE INDEX "organization_projects_workspaceId_status_idx" ON "organization_projects"("workspaceId", "status");
CREATE INDEX "workspace_weekly_updates_workspaceId_weekEnding_idx" ON "workspace_weekly_updates"("workspaceId", "weekEnding");
CREATE INDEX "workspace_weekly_updates_workspaceId_status_idx" ON "workspace_weekly_updates"("workspaceId", "status");
ALTER TABLE "organization_projects" ADD CONSTRAINT "organization_projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_projects" ADD CONSTRAINT "organization_projects_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "workspace_weekly_updates" ADD CONSTRAINT "workspace_weekly_updates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_weekly_updates" ADD CONSTRAINT "workspace_weekly_updates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "organization_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "workspace_weekly_updates" ADD CONSTRAINT "workspace_weekly_updates_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "workspace_weekly_updates" ADD CONSTRAINT "workspace_weekly_updates_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "organization_projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_weekly_updates" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "organization_projects" FROM anon, authenticated;
REVOKE ALL ON TABLE "workspace_weekly_updates" FROM anon, authenticated;
