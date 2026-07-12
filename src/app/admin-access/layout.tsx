import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrator Setup | GEM Enterprise",
  description: "One-time GEM Enterprise administrator password setup.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  referrer: "no-referrer",
};

export default function AdminAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
