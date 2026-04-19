import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HubShell } from "@/components/hub/HubShell";

export const metadata: Metadata = {
  title: {
    default: "Community Hub",
    template: "%s | GEM Community Hub",
  },
  description:
    "GEM Community Hub — a private, verified network for partners, operators, investors, clients, and advisors executing across jurisdictions.",
};

export default function CommunityHubLayout({ children }: { children: ReactNode }) {
  return <HubShell>{children}</HubShell>;
}
