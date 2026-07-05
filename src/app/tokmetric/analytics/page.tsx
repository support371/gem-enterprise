import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Analytics",
  description: "TokMetric analytics with source-labeled reporting for live, manual, imported, seeded, calculated, or unknown data.",
  alternates: { canonical: "/tokmetric/analytics" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="analytics" />;
}
