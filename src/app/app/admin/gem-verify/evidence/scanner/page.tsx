import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  KeyRound,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEvidenceVaultRuntimeReadiness } from "@/lib/kyc/evidence-vault";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Scanner Operations | GEM Verify",
  description:
    "Protected configuration and assurance status for the GEM Verify first-party evidence scanner.",
  robots: {
    index: false,
    follow: false,
  },
};

function State({ passed }: { passed: boolean }) {
  return passed ? (
    <Badge className="border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Ready
    </Badge>
  ) : (
    <Badge className="border-amber-400/25 bg-amber-400/10 text-amber-200">
      <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Required
    </Badge>
  );
}

export default function EvidenceScannerOperationsPage() {
  const readiness = getEvidenceVaultRuntimeReadiness();
  const scannerUrl =
    "https://www.gemcybersecurityassist.com/api/verify/evidence/internal-scanner";

  const controls = [
    {
      label: "First-party scanner selected",
      passed: readiness.firstPartyScannerSelected,
      detail: "GEM owns and operates the static file-safety scanner endpoint.",
      icon: ShieldCheck,
    },
    {
      label: "Internal scanner URL",
      passed: readiness.firstPartyScannerUrlConfigured,
      detail: scannerUrl,
      icon: FileSearch,
    },
    {
      label: "Scanner request secret",
      passed: readiness.scannerEndpointConfigured,
      detail: "GEM_VERIFY_SCANNER_TOKEN must be a private value of at least 32 characters.",
      icon: KeyRound,
    },
    {
      label: "Callback authentication",
      passed: readiness.scannerCallbackConfigured,
      detail: "GEM_VERIFY_SCANNER_CALLBACK_SECRET signs short-lived result callbacks.",
      icon: LockKeyhole,
    },
    {
      label: "Production callback origin",
      passed: readiness.publicBaseUrlConfigured,
      detail: "The scanner only returns results to the approved GEM production origin.",
      icon: Activity,
    },
    {
      label: "Stale scan fail-closed job",
      passed: true,
      detail: "Scans older than 20 minutes are moved to manual hold; no evidence is released.",
      icon: TimerReset,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            GEM-owned scanning control plane
          </div>
          <h1 className="mt-3 text-3xl font-black text-white">Scanner Operations</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            Configure and monitor GEM&apos;s first-party structural file-safety scanner.
            This engine validates checksums and file structure, blocks dangerous PDF
            actions and appended polyglot data, and keeps uncertain files on manual hold.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/api/verify/evidence/internal-scanner" target="_blank">
              Open scanner health
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/admin/gem-verify/evidence/governance">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Governance
            </Link>
          </Button>
        </div>
      </header>

      <section
        className={`rounded-2xl border p-6 ${
          readiness.scannerConfigured
            ? "border-emerald-500/25 bg-emerald-500/5"
            : "border-amber-500/25 bg-amber-500/5"
        }`}
      >
        <div className="flex items-start gap-3">
          {readiness.scannerConfigured ? (
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-300" />
          ) : (
            <ShieldAlert className="mt-0.5 h-6 w-6 text-amber-300" />
          )}
          <div>
            <h2 className="font-bold text-white">
              {readiness.scannerConfigured
                ? "First-party scanner configured"
                : "Scanner deployed; secret configuration still required"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Engine: <span className="font-mono text-cyan-300">gem-static-safety-v1</span>.
              Assurance: structural file safety only. This engine is not represented as
              antivirus-equivalent, biometric verification or government-document
              authenticity validation.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {controls.map(({ label, passed, detail, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              <State passed={passed} />
            </div>
            <h2 className="mt-4 font-bold text-white">{label}</h2>
            <p className="mt-2 break-all text-xs leading-5 text-slate-400">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h2 className="font-bold text-white">Required production variables</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Values remain encrypted in Vercel. Only names and the expected non-secret URL
            are shown here.
          </p>
          <dl className="mt-5 space-y-3 text-sm">
            {[
              ["GEM_VERIFY_SCANNER_MODE", "first_party"],
              ["GEM_VERIFY_SCANNER_URL", scannerUrl],
              ["GEM_VERIFY_SCANNER_TOKEN", "<private 32+ character secret>"],
              ["GEM_VERIFY_SCANNER_CALLBACK_SECRET", "<different private 32+ character secret>"],
              ["GEM_VERIFY_PUBLIC_BASE_URL", "https://www.gemcybersecurityassist.com"],
              ["CRON_SECRET", "<private 32+ character secret>"],
            ].map(([name, value]) => (
              <div key={name} className="rounded-xl border border-white/10 bg-black/10 p-4">
                <dt className="font-mono text-xs text-cyan-300">{name}</dt>
                <dd className="mt-1 break-all text-xs text-slate-400">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <h2 className="font-bold text-white">Implemented checks</h2>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <p>• SHA-256 and authorized-size verification</p>
              <p>• PDF header, trailer and active-content controls</p>
              <p>• PNG chunk, dimensions and terminal-data controls</p>
              <p>• JPEG marker, dimensions and terminal-data controls</p>
              <p>• Appended polyglot-data blocking</p>
              <p>• Signed callback validation and strict destination allowlists</p>
              <p>• Automatic manual hold for scanner errors and timeouts</p>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
            <h2 className="font-bold text-white">Deliberate limits</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Passing the scanner means the file passed GEM&apos;s structural safety rules.
              It does not prove that an identity document is authentic and does not replace
              human review, issuer validation, chip reading, biometric liveness or an
              independently maintained malware-signature engine.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
