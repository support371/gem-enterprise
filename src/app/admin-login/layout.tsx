import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Administrator Access | GEM Enterprise" },
  description: "Sign in to the scoped GEM Enterprise administration surface.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
