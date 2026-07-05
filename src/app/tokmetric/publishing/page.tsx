import type { Metadata } from "next";
import { TokMetricWorkspacePage } from "@/components/tokmetric/TokMetricWorkspacePage";
import { TokMetricVideoPublisher } from "@/components/tokmetric/TokMetricVideoPublisher";

export const metadata: Metadata = {
  title: "TokMetric Video Publishing",
  description: "Governed TikTok video publishing with creator settings, explicit consent, direct file transfer, status polling, and platform confirmation.",
  alternates: { canonical: "/tokmetric/publishing" },
};

export default function Page() {
  return (
    <>
      <TokMetricWorkspacePage kind="publishing" />
      <section className="border-t border-white/[0.08] bg-[#091019] px-4 py-12 text-white sm:px-6">
        <div className="mx-auto max-w-screen-xl">
          <TokMetricVideoPublisher />
        </div>
      </section>
    </>
  );
}
