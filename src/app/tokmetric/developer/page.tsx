import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Developer Console",
  description: "TokMetric developer console for OAuth, API, webhook, GPT Action, logs, and readiness management.",
  alternates: { canonical: "/tokmetric/developer" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="developer" />;
}
