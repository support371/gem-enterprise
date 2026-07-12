import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Recovery | GEM Enterprise",
  description: "Secure GEM Enterprise account recovery request.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
  },
  referrer: "no-referrer",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
