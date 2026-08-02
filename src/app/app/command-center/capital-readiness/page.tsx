import type { Metadata } from "next";
import { CapitalReadinessCommandCenter } from "@/components/command-center/CapitalReadinessCommandCenter";

export const metadata: Metadata = {
  title: "Capital Readiness Command Center | GEM Enterprise",
  description: "Controlled opportunity, KYB, readiness, partner routing, diligence, closing, and post-close revenue operations.",
};

export default function CapitalReadinessCommandCenterPage() {
  return <CapitalReadinessCommandCenter />;
}
