import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/StorefrontPage";

export const metadata: Metadata = {
  title: "TikTok Shop | GEM Enterprise",
  description:
    "Browse GEM products prepared for TikTok Shop and social-commerce campaigns from the official GEM website.",
};

export default function TikTokStorePage() {
  return <StorefrontPage storefront="tiktok" />;
}
