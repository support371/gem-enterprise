import type { Metadata } from "next";
import { TokMetricSetupStatus } from "@/components/tokmetric/TokMetricSetupStatus";

export const metadata: Metadata = {
  title: "TikTok Setup | TokMetric | GEM Enterprise",
  description: "TikTok Developer Portal submission package and controlled connector status.",
  alternates: { canonical: "/tokmetric/setup-status" },
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <TokMetricSetupStatus initialTab="submission" />;
}
