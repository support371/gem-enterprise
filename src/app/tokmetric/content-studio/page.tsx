import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";

export const metadata: Metadata = {
  title: "TokMetric Content Studio",
  description: "TokMetric content studio for drafts, scripts, captions, media, scheduling, and version review.",
  alternates: { canonical: "/tokmetric/content-studio" },
};

export default function Page() {
  return <TokMetricWorkspacePage kind="content" />;
}
