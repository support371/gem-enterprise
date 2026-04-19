import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KYC Verification | GEM Enterprise",
  description: "Complete identity verification to access the GEM Enterprise client portal.",
  robots: { index: false, follow: false },
};

export default function KYCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* KYC progress header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M20 3L5 10v10c0 9.39 6.39 18.17 15 20.31C29.61 38.17 36 29.39 36 20V10L20 3z"
                fill="hsl(var(--electric-cyan)/0.15)"
                stroke="hsl(var(--electric-cyan))"
                strokeWidth="1.5"
              />
              <path
                d="M14 20l4 4 8-8"
                stroke="hsl(var(--electric-cyan))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold text-foreground text-sm">
              KYC Verification
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono tracking-wider hidden sm:block">
            GEM Enterprise — Secure Identity Verification
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
    </div>
  );
}
