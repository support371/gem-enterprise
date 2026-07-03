import type { Metadata } from "next";
import { StorefrontPage } from "@/components/store/StorefrontPage";

export const metadata: Metadata = {
  title: "Facebook Shop | GEM Enterprise",
  description:
    "Browse GEM cybersecurity and real estate security products and visit our Facebook page to explore our shop and service offerings.",
};

export default function FacebookStorePage() {
  return <StorefrontPage storefront="facebook" />;
}
