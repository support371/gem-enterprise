import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust Center | GEM Enterprise",
  description: "Security, privacy, compliance alignment, and responsible disclosure information for GEM Enterprise.",
};

const controls = [
  "Role-based access controls for protected client and administrative routes.",
  "Encrypted transport, secure session cookies, rate limiting, and audit logging.",
  "KYC-gated workflows and human review for high-impact operations.",
  "Fail-closed production controls for external integrations and publishing.",
  "Incident response, evidence preservation, and operational monitoring procedures.",
];

const alignments = [
  "NIST Cybersecurity Framework control mapping",
  "ISO/IEC 27001 readiness alignment",
  "SOC 2 trust-services control mapping",
  "Applicable GDPR privacy principles and data-subject handling",
  "HIPAA safeguard consideration where regulated information is in scope",
  "CMMC practice mapping for relevant defense-supply-chain engagements",
];

export default function TrustCenterPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Trust Center</p>
      <h1 className="mt-3 text-4xl font-bold">Security and compliance overview</h1>
      <p className="mt-5 max-w-3xl leading-7 text-slate-300">
        GEM Enterprise publishes this overview to support customer due diligence. Alignment statements describe control design and readiness; they do not claim a certification unless a current certificate is separately provided.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold">Core controls</h2>
          <ul className="mt-5 space-y-3 text-slate-300">
            {controls.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold">Framework alignment</h2>
          <ul className="mt-5 space-y-3 text-slate-300">
            {alignments.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
        <h2 className="text-2xl font-semibold">Responsible disclosure</h2>
        <p className="mt-3 leading-7 text-slate-300">
          Security concerns should be reported privately through the contact channel. Do not include credentials, private keys, identity documents, or exploit data in public reports.
        </p>
        <Link href="/contact" className="mt-5 inline-flex font-semibold text-cyan-300 hover:underline">
          Contact GEM Enterprise
        </Link>
      </section>
    </main>
  );
}
