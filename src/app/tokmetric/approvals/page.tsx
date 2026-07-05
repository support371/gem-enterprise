import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Approval Center",
  description: "TokMetric approval center for exact-version human approval, role controls, and audit readiness.",
  alternates: { canonical: "/tokmetric/approvals" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="approvals" />;
}
