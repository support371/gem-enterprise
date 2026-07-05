import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Dashboard",
  description: "TokMetric command dashboard for workspace, connector, approval, publishing, and compliance readiness.",
  alternates: { canonical: "/tokmetric/dashboard" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="dashboard" />;
}
