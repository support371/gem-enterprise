import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Client Portal Access | GEM Enterprise" },
  description: "Sign in to an authorized GEM Enterprise client or administrator account.",
  robots: { index: false, follow: false, nocache: true },
};

export default function ClientLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
