import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | GEM Enterprise",
  description: "Continue to the authenticated organization and project workspace.",
};

export default function DashboardPage() {
  redirect("/app/workspace");
}
