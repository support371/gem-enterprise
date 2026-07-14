-- Add an optional workspace scope without reclassifying personal requests.
ALTER TABLE public."requests"
  ADD COLUMN "workspaceId" TEXT;

-- Support membership-scoped request timelines without changing existing user ownership.
CREATE INDEX "requests_workspaceId_createdAt_idx"
  ON public."requests" ("workspaceId", "createdAt");

-- Workspace deletion preserves the client request as a personal historical record.
ALTER TABLE public."requests"
  ADD CONSTRAINT "requests_workspaceId_fkey"
  FOREIGN KEY ("workspaceId")
  REFERENCES public."tokmetric_workspaces"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
