import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Compliance Center",
  description: "TokMetric compliance center for policy, disclosure, copyright, music, and platform review.",
  alternates: { canonical: "/tokmetric/compliance" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="compliance" />;
}
