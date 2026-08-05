import type { Metadata } from "next";
import { TokMetricSetupStatus } from "@/components/tokmetric/TokMetricSetupStatus";

export const metadata: Metadata = {
  title: "TikTok Readiness | TokMetric | GEM Enterprise",
  description: "Verified connector, scope, health, and publishing-lock readiness for TokMetric.",
  alternates: { canonical: "/tokmetric/setup-status" },
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <TokMetricSetupStatus initialTab="connection" />;
}
