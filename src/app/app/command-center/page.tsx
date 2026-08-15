import type { Metadata } from "next";
import { CommandCenterView } from "@/components/command-center/CommandCenterView";

export const metadata: Metadata = {
  title: "Enterprise Command Center | GEM Enterprise",
  description: "Role-directed directory for GEM Enterprise operating workspaces and controlled SaaS functions.",
};

export default function CommandCenterPage() {
  return <CommandCenterView section="overview" />;
}
