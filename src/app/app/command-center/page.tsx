import type { Metadata } from "next";
import { CommandCenterView } from "@/components/command-center/CommandCenterView";

export const metadata: Metadata = {
  title: "Enterprise Command Center | GEM Enterprise",
  description: "Unified analytics, security, compliance, revenue, client, and AI operations command center.",
};

export default function CommandCenterPage() {
  return <CommandCenterView section="overview" />;
}
