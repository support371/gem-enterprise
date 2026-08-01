import type { Metadata } from "next";
import { NewsForgeIntegrationStatus } from "@/components/command-center/NewsForgeIntegrationStatus";

export const metadata: Metadata = {
  title: "News Forge Integration | GEM Enterprise Command Center",
  description:
    "Live verification of the News Forge host, source commit, route contract, framing policy, and GEM deployment binding.",
};

export default function NewsForgeIntegrationPage() {
  return <NewsForgeIntegrationStatus />;
}
