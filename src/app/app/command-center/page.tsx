import type { Metadata } from "next";
import { CommandCenterView } from "@/components/command-center/CommandCenterView";
import { LiveCommandCenterSnapshot } from "@/components/command-center/LiveCommandCenterSnapshot";

export const metadata: Metadata = {
  title: "Enterprise Command Center | GEM Enterprise",
  description: "Unified analytics, security, compliance, revenue, client, and AI operations command center.",
};

export default function CommandCenterPage() {
  return (
    <div className="space-y-6">
      <LiveCommandCenterSnapshot />
      <CommandCenterView section="overview" />
    </div>
  );
}
