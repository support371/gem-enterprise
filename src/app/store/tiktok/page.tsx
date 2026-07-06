import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/StorefrontPage";
import { TIKTOK_MAIN_STORE_URL } from "@/lib/storefrontDestinations";

export const metadata: Metadata = {
  title: "Main TikTok Shop | GEM Enterprise",
  description:
    "Browse GEM products prepared for TikTok Shop and continue to the connected main TikTok storefront.",
};

export default function TikTokStorePage() {
  return (
    <StorefrontPage
      storefront="tiktok"
      eyebrow="Connected TikTok commerce storefront"
      title="Shop GEM products through the main TikTok Shop"
      description="Browse the GEM TikTok-ready catalogue, then continue to the connected main TikTok storefront."
      status="Connected"
      externalUrl={TIKTOK_MAIN_STORE_URL}
      externalLabel="Open Main TikTok Shop"
    />
  );
}
