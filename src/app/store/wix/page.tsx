import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/StorefrontPage";

export const metadata: Metadata = {
  title: "Wix Store Sync | GEM Enterprise",
  description:
    "Browse Wix-origin and synchronized products mapped into the official GEM Enterprise store.",
};

export default function WixStorePage() {
  return <StorefrontPage storefront="wix" />;
}
