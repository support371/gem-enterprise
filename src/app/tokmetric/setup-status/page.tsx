import type { Metadata } from "next";
import { TokMetricSetupStatus } from "@/components/tokmetric/TokMetricSetupStatus";

export const metadata: Metadata = {
  title: "TikTok Setup Status | TokMetric | GEM Enterprise",
  description:
    "Operator-facing TikTok submission checklist and verified GEM connector readiness for the controlled TokMetric workflow.",
  alternates: { canonical: "/tokmetric/setup-status" },
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <TokMetricSetupStatus initialTab="submission" />;
}
