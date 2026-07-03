import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/StorefrontPage";

export const metadata: Metadata = {
  title: "GEM Main Store | GEM Enterprise",
  description:
    "Browse the main GEM Enterprise product catalog of security products, client gifts, property-care tools, office essentials, and digital software.",
};

export default function MainStorePage() {
  return <StorefrontPage storefront="main" />;
}
