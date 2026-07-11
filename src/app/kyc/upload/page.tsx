import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import EvidenceUploadClient from "@/components/kyc/EvidenceUploadClient";

export const metadata = {
  title: "Secure Evidence Upload | GEM Verify",
  description:
    "Authenticated, private and fail-closed evidence submission for GEM Verify applications.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KYCUploadPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/kyc/start"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to verification overview
      </Link>

      <header className="mb-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
            <LockKeyhole className="h-7 w-7 text-cyan-300" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              GEM Verify
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Secure evidence submission
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Evidence is submitted through a one-time authorization into a private quarantine area. The system validates the real file signature, records a SHA-256 checksum and requires a clean security scan before authorized reviewer access.
            </p>
          </div>
        </div>
      </header>

      <EvidenceUploadClient />

      <p className="mt-8 text-center text-xs leading-5 text-white/45">
        Never upload passwords, one-time security codes, private keys, banking credentials or account recovery secrets as verification evidence.
      </p>
    </main>
  );
}
