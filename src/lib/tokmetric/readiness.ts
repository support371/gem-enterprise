import { db } from "@/lib/db";

export async function getTokMetricReadiness() {
  const [workspaces, connectors, drafts, approvals, publishJobs, analytics] = await Promise.all([
    db.workspace.count(),
    db.connector.groupBy({ by: ["state"], _count: true }),
    db.content.count({ where: { state: "DRAFT" } }),
    db.approvalRequest.count({ where: { state: "APPROVAL_REQUIRED" } }),
    db.publishJob.groupBy({ by: ["internalState", "externalState"], _count: true }),
    db.analyticsSnapshot.count(),
  ]);
  return {
    livePublishingEnabled: process.env.TOKMETRIC_LIVE_PUBLISHING_ENABLED === "true",
    workspaces,
    connectors,
    drafts,
    approvals,
    publishJobs,
    analytics,
    externalTruth: "Live TikTok operations remain disabled unless production activation gates pass.",
  };
}
