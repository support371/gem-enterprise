import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Team Workspace Access | GEM Enterprise" },
  description: "Sign in to an assigned GEM Enterprise team and project workspace.",
  robots: { index: false, follow: false, nocache: true },
};

export default function TeamLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
