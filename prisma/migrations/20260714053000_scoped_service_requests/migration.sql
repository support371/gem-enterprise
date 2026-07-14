-- Add an optional workspace scope without reclassifying personal requests.
ALTER TABLE public."requests"
  ADD COLUMN "workspaceId" TEXT;

-- Support membership-scoped request timelines without changing existing user ownership.
CREATE INDEX "requests_workspaceId_createdAt_idx"
  ON public."requests" ("workspaceId", "createdAt");

-- Preserve workspace provenance. A workspace with historical scoped requests must
-- be retained or deliberately reconciled before deletion; it must not silently
-- convert those requests into personal records.
ALTER TABLE public."requests"
  ADD CONSTRAINT "requests_workspaceId_fkey"
  FOREIGN KEY ("workspaceId")
  REFERENCES public."tokmetric_workspaces"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Keep direct PostgREST access fail-closed. The application uses its authoritative
-- server-side database connection and no public RLS policy is introduced here.
ALTER TABLE public."requests" ENABLE ROW LEVEL SECURITY;
