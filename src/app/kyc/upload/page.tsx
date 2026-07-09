import Link from "next/link";
import { AlertTriangle, ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Secure Document Upload",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KYCUploadPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link
        href="/kyc/start"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to verification overview
      </Link>

      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-7 text-amber-50">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3">
            <LockKeyhole className="h-6 w-6 text-amber-200" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Secure upload not yet activated
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">
              Do not send identity or financial documents through this website yet
            </h1>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-black/15 p-4 text-sm leading-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
          <p>
            The production private-storage, malware-scanning, access-audit, retention, and
            authorized-review pipeline has not been fully activated. To protect applicants,
            this page is intentionally fail-closed and does not accept files.
          </p>
        </div>

        <p className="mt-6 text-sm leading-6 text-amber-50/85">
          GEM will enable document submission only after the storage provider, encryption,
          short-lived upload authorization, file-signature validation, malware scanning,
          reviewer permissions, deletion controls, and retention policy have been tested
          end to end.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="bg-amber-300 font-semibold text-black hover:bg-amber-200">
            <Link href="/contact?subject=verification">Contact verification support</Link>
          </Button>
          <Button asChild variant="outline" className="border-amber-200/30 text-white hover:bg-white/10">
            <Link href="/eligibility/status">Check eligibility status</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
