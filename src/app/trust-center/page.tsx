import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust Center | GEM Enterprise",
  description:
    "Security overview, data protection, responsible disclosure, compliance mapping, subprocessors, and vendor due diligence information for GEM Enterprise.",
};

/* ─── Data ──────────────────────────────────────────────────────────────── */

const securityPillars = [
  {
    icon: "🔒",
    title: "Access controls",
    body: "Role-based access control (RBAC), KYC-gated onboarding, least-privilege permissions, and MFA enforcement for privileged accounts.",
  },
  {
    icon: "🔐",
    title: "Data in transit",
    body: "All platform traffic is encrypted via TLS 1.2+ with HSTS enforcement. Cleartext communication is not permitted.",
  },
  {
    icon: "🗃️",
    title: "Data at rest",
    body: "Sensitive fields are encrypted at rest. Database access is restricted by network policy and authenticated credentials.",
  },
  {
    icon: "📋",
    title: "Audit logging",
    body: "Authentication events, privileged actions, and data access are recorded with immutable audit logs for investigative and compliance use.",
  },
  {
    icon: "🛡️",
    title: "Application security",
    body: "Security headers (CSP, HSTS, X-Frame-Options), CSRF protection, rate limiting, and input validation are applied at the application layer.",
  },
  {
    icon: "🔍",
    title: "Vulnerability management",
    body: "Dependencies are monitored for known vulnerabilities. Critical patches are prioritised through a documented remediation process.",
  },
];

const complianceMappings = [
  {
    framework: "SOC 2",
    detail:
      "Controls designed to align with SOC 2 Trust Services Criteria (Security, Availability, Confidentiality). Formal attestation available upon verified client request where applicable.",
  },
  {
    framework: "ISO 27001",
    detail:
      "Information security management controls mapped to ISO/IEC 27001 Annex A domains. Certification readiness maintained; formal certification in progress where applicable.",
  },
  {
    framework: "NIST CSF",
    detail:
      "Security functions mapped across Identify, Protect, Detect, Respond, and Recover domains of the NIST Cybersecurity Framework v2.0.",
  },
  {
    framework: "GDPR",
    detail:
      "Privacy principles (lawfulness, purpose limitation, data minimisation, accuracy, storage limitation, integrity) supported for applicable data subject requests and EU-originated processing.",
  },
  {
    framework: "HIPAA",
    detail:
      "Administrative, physical, and technical safeguards considered for engagements that involve regulated health information. GEM does not assert covered-entity status by default — applicability is scoped per engagement.",
  },
  {
    framework: "CMMC",
    detail:
      "CMMC practices mapped for defence supply-chain readiness assessments. Formal certification is not claimed unless separately evidenced for a specific engagement scope.",
  },
];

const subprocessorCategories = [
  { category: "Cloud infrastructure", example: "Hosting, CDN, object storage, serverless runtime" },
  { category: "Email delivery", example: "Transactional and notification email services" },
  { category: "Payment processing", example: "Secure card and ACH payment handling" },
  { category: "Analytics", example: "Aggregate, privacy-respecting site performance analytics" },
  { category: "AI / LLM services", example: "AI inference providers used for platform intelligence features" },
  { category: "Identity / KYC", example: "Identity verification and document check services" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3 text-sm text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
}

export default function TrustCenterPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20">

      {/* ── Header ──────────────────────────────────────────────── */}
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Trust Center</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight text-white">
        Security &amp; compliance overview
      </h1>
      <p className="mt-5 max-w-3xl text-slate-300 leading-relaxed">
        GEM Enterprise is designed to align with enterprise security, privacy, evidence-retention,
        and vendor due-diligence expectations for qualified institutional clients. This page is the
        single reference for our security posture, data handling commitments, responsible
        disclosure process, and compliance mapping. Formal attestations are provided only when
        available and upon verified client request.
      </p>

      {/* ── Security overview ───────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-white">Security overview</h2>
        <p className="mt-3 text-slate-400 text-sm">
          GEM Enterprise applies a defence-in-depth model across infrastructure, application, and
          operational layers.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {securityPillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-2xl leading-none">{p.icon}</p>
              <p className="mt-3 font-semibold text-white text-sm">{p.title}</p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Data protection ──────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-white">Data protection</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Card title="Data handling principles">
            Client data is processed under least-privilege access, purpose-limitation controls, and
            documented retention schedules. Evidence records follow the platform retention model
            and are not used for purposes beyond the original engagement scope.
          </Card>
          <Card title="Data subject rights">
            Individuals whose data is processed through GEM Enterprise may submit access,
            correction, deletion, or portability requests. Requests are reviewed within applicable
            statutory periods. Contact{" "}
            <a className="text-cyan-300 hover:text-cyan-200" href="mailto:privacy@gemcybersecurityassist.com">
              privacy@gemcybersecurityassist.com
            </a>
            .
          </Card>
          <Card title="Retention and deletion">
            Operational data is retained only as long as necessary for the stated purpose or as
            required by applicable law. Secure deletion procedures are applied to data that has
            passed its retention period.
          </Card>
          <Card title="Incident response">
            A documented incident response procedure covers detection, containment, eradication,
            recovery, and notification. Affected clients are notified in accordance with
            contractual and regulatory obligations.
          </Card>
        </div>
      </section>

      {/* ── Responsible disclosure ───────────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-white">Responsible disclosure</h2>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-slate-300 leading-relaxed">
            GEM Enterprise welcomes reports of potential security vulnerabilities from the research
            community and clients. To report a suspected issue:
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            {[
              [
                "Email us",
                <>
                  Send a detailed report to{" "}
                  <a className="text-cyan-300 hover:text-cyan-200" href="mailto:security@gemcybersecurityassist.com">
                    security@gemcybersecurityassist.com
                  </a>
                  . Encrypt sensitive details using our PGP key (available on request).
                </>,
              ],
              [
                "Include reproducible steps",
                "Provide affected URLs, request/response examples, and proof-of-concept details sufficient to reproduce the issue.",
              ],
              [
                "Do not access client data",
                "Testing must not involve accessing, modifying, or exfiltrating real client records or production data.",
              ],
              [
                "Allow time to respond",
                "We aim to acknowledge reports within 2 business days and provide an initial assessment within 10 business days.",
              ],
              [
                "Coordinated disclosure",
                "Please allow us a reasonable remediation window before public disclosure. We are committed to transparent, coordinated disclosure practices.",
              ],
            ].map(([title, body]) => (
              <li key={title as string} className="flex gap-4">
                <span className="text-cyan-300 mt-0.5 shrink-0 text-xs">▸</span>
                <span>
                  <strong className="text-white">{title}:</strong>{" "}
                  <span className="text-slate-400">{body as React.ReactNode}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Compliance mapping ───────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-white">Compliance mapping</h2>
        <p className="mt-3 text-slate-400 text-sm max-w-2xl">
          The following frameworks are referenced in our security and privacy programmes. Mapping
          to a framework does not constitute certification unless separately evidenced.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {complianceMappings.map((m) => (
            <div key={m.framework} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{m.framework}</p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Subprocessors ────────────────────────────────────────── */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-white">Subprocessors</h2>
        <p className="mt-3 text-slate-400 text-sm max-w-2xl">
          GEM Enterprise engages third-party subprocessors only where those services are necessary
          for platform operations or a specific client engagement. The categories below represent
          the types of subprocessors that may be engaged. A named subprocessor list is available
          upon verified client request.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-2 bg-white/10 text-xs font-semibold uppercase tracking-wide text-white">
            <div className="p-4">Category</div>
            <div className="p-4">Use</div>
          </div>
          {subprocessorCategories.map((s, i) => (
            <div
              key={s.category}
              className={`grid grid-cols-2 border-t border-white/10 text-sm ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}
            >
              <div className="p-4 font-medium text-white">{s.category}</div>
              <div className="p-4 text-slate-400">{s.example}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          To request the full named subprocessor list, email{" "}
          <a className="text-cyan-400 hover:text-cyan-300" href="mailto:privacy@gemcybersecurityassist.com">
            privacy@gemcybersecurityassist.com
          </a>
          .
        </p>
      </section>

      {/* ── Vendor due diligence ─────────────────────────────────── */}
      <section className="mt-14">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Procurement</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Vendor due diligence request</h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Qualified prospects and existing clients may request supporting documentation for
            vendor due diligence processes, including:
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-300">
            {[
              "Security questionnaire responses (SIG, CAIQ, or custom)",
              "Architecture and data-flow summaries",
              "Business continuity and disaster recovery overview",
              "Insurance certificates (where applicable)",
              "Available attestation or audit evidence",
              "Data processing addendum (DPA)",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-cyan-300 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-slate-400">
            Documentation is provided under NDA or equivalent confidentiality terms to verified
            institutional clients and qualified prospects only.
          </p>
          <Link
            href="/contact?topic=vendor-due-diligence"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-200 transition-colors"
          >
            Request due diligence package
          </Link>
        </div>
      </section>

      {/* ── Security contact ─────────────────────────────────────── */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card title="Security contact">
          For vulnerability reports, security incidents, or platform security questions:{" "}
          <a className="text-cyan-300 hover:text-cyan-200 block mt-2" href="mailto:security@gemcybersecurityassist.com">
            security@gemcybersecurityassist.com
          </a>
        </Card>
        <Card title="Privacy contact">
          For data subject requests, privacy questions, subprocessor requests, or DPA enquiries:{" "}
          <a className="text-cyan-300 hover:text-cyan-200 block mt-2" href="mailto:privacy@gemcybersecurityassist.com">
            privacy@gemcybersecurityassist.com
          </a>
        </Card>
      </section>

    </main>
  );
}
