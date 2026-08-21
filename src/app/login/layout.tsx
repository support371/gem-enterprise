import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Secure Workspace Sign In | GEM Enterprise" },
  description:
    "Verify your GEM Enterprise identity and continue to your assigned organization workspace.",
  robots: { index: false, follow: false, nocache: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
