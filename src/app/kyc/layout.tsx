import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Application | GEM Enterprise",
  description:
    "Controlled manual eligibility review for authorized GEM applicants.",
  robots: { index: false, follow: false, nocache: true },
};

export default function KYCLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] glass-panel">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-sm font-bold text-cyan-400">
              G
            </div>
            <span className="text-sm font-semibold text-foreground">
              GEM Verify — Manual Review Pilot
            </span>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
            No document or biometric upload
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
    </div>
  );
}
