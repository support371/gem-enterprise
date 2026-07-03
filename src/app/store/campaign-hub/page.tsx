import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/StorefrontPage";

export const metadata: Metadata = {
  title: "Campaign Hub Store | GEM Enterprise",
  description:
    "Browse campaign-ready GEM products, awareness tools, digital offers, and lead-generation services.",
};

export default function CampaignHubStorePage() {
  return <StorefrontPage storefront="campaign-hub" />;
}
