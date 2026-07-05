import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Accounts",
  description: "TokMetric connector readiness for TikTok Organic, Shop, Business, Ads, and developer applications.",
  alternates: { canonical: "/tokmetric/accounts" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="accounts" />;
}
