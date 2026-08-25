import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Secure Sign-in Directory | GEM Enterprise" },
  description: "Choose the authorized GEM Enterprise client, team, admin, or Super Admin access route.",
  robots: { index: false, follow: false, nocache: true },
};

export default function LoginDirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
