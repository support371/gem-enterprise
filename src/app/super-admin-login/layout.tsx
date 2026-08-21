import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Super Admin Control Center | GEM Enterprise" },
  description: "Sign in to the protected GEM Enterprise platform-owner control center.",
  robots: { index: false, follow: false, nocache: true },
};

export default function SuperAdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
