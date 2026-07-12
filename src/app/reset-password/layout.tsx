import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | GEM Enterprise",
  description: "Secure GEM Enterprise password reset.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
  },
  referrer: "no-referrer",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
