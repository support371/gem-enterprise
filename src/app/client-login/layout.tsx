import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal Access | GEM Enterprise",
  description: "Sign in to your GEM Enterprise client portal.",
  robots: { index: false, follow: false },
};

export default function ClientLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
