import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/StorefrontPage";

export const metadata: Metadata = {
  title: "Google Merchant Store | GEM Enterprise",
  description:
    "Browse GEM products prepared for Google Merchant Center and product-feed distribution.",
};

export default function GoogleStorePage() {
  return <StorefrontPage storefront="google" />;
}
