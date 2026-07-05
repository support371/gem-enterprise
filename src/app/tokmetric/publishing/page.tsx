import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Publishing Queue",
  description: "TokMetric publishing queue for controlled external submissions, internal job states, and platform confirmation tracking.",
  alternates: { canonical: "/tokmetric/publishing" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="publishing" />;
}
