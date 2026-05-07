import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  Fingerprint,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  UploadCloud,
  User,
  Users,
} from "lucide-react";

const ENTITY_TYPES = [
  {
    id: "individual",
    label: "Individual",
    description: "For individual accredited investors seeking personal verification.",
    href: "/kyc/individual",
    icon: User,
    requirements: [
      "Government-issued photo ID",
      "Proof of address (< 3 months)",
      "Financial accreditation evidence",
    ],
  },
  {
    id: "business",
    label: "Business",
    description: "For corporations, LLCs, and other registered business entities.",
    href: "/kyc/business",
    icon: Building2,
    requirements: [
      "Certificate of incorporation",
      "Beneficial ownership disclosure",
      "Registered address documentation",
    ],
  },
  {
    id: "trust",
    label: "Trust",
    description: "For trust entities including revocable and irrevocable trusts.",
    href: "/kyc/trust",
    icon: Landmark,
    requirements: [
      "Trust deed / trust agreement",
      "Trustee identification",
      "Beneficiary information",
    ],
  },
  {
    id: "family-office",
    label: "Family Office",
    description: "For single and multi-family office investment structures.",
    href: "/kyc/family-office",
    icon: Users,
    requirements: [
      "Family office establishment documents",
      "Principal family member IDs",
      "Investment mandate disclosure",
    ],
  },
];

const FLOW_STEPS = [
  {
    title: "Select Entity",
    description: "Choose individual, business, trust, or family-office verification.",
    icon: Fingerprint,
  },
  {
    title: "Complete Application",
    description: "Submit the required identity and ownership information.",
    icon: FileCheck2,
  },
  {
    title: "Upload Evidence",
    description: "Attach supporting documents for compliance review.",
    icon: UploadCloud,
  },
  {
    title: "Review & Decision",
    description: "Compliance team approves, rejects, or escalates for manual review.",
    icon: ShieldCheck,
  },
];

const TRUST_ITEMS = [
  "Encrypted verification workflow",
  "Compliance review before entitlement access",
  "Document-backed audit trail",
  "Manual review path for complex entities",
];

export default function KYCStartPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <Link
        href="/get-started"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Back to Get Started
      </Link>

      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--electric-cyan)/0.3)] bg-[hsl(var(--electric-cyan)/0.1)] px-3 py-1 text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))]">
            <ShieldCheck className="h-3 w-3" />
            Identity Verification
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Begin institutional verification.
          </h1>

          <p className="max-w-2xl text-muted-foreground leading-relaxed">
            Select the entity type that matches your client profile. GEM Enterprise uses this onboarding stage to route your application through the correct verification, document, and compliance-review path.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-[hsl(var(--electric-cyan)/0.2)] p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Verification lifecycle</p>
              <p className="mt-1 text-xs text-muted-foreground">Typical completion: 10–15 minutes before review submission.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--electric-cyan)/0.1)]">
              <Clock className="h-5 w-5 text-[hsl(var(--electric-cyan))]" />
            </div>
          </div>

          <div className="space-y-3">
            {FLOW_STEPS.map(({ title, description, icon: Icon }, index) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-[hsl(var(--border))] bg-background/60 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--electric-cyan)/0.25)] bg-[hsl(var(--electric-cyan)/0.1)] font-mono text-xs text-[hsl(var(--electric-cyan))]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[hsl(var(--electric-cyan))]" />
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))]">Entity Routing</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Choose your verification path</h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Your selection determines the application questions and documents requested next.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ENTITY_TYPES.map((entity) => {
            const Icon = entity.icon;

            return (
              <Link
                key={entity.id}
                href={entity.href}
                className="group glass-panel block rounded-2xl border border-[hsl(var(--border))] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(var(--electric-cyan)/0.5)] hover:shadow-[0_0_24px_hsl(var(--electric-cyan)/0.1)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))] focus:ring-offset-2 focus:ring-offset-background"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--electric-cyan)/0.1)] transition-colors group-hover:bg-[hsl(var(--electric-cyan)/0.15)]">
                  <Icon className="h-6 w-6 text-[hsl(var(--electric-cyan))]" aria-hidden="true" />
                </div>

                <h3 className="mb-1.5 font-semibold text-foreground transition-colors group-hover:text-[hsl(var(--electric-cyan))]">
                  {entity.label}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {entity.description}
                </p>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                    Typical Requirements
                  </p>
                  <ul className="space-y-1">
                    {entity.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[hsl(var(--electric-cyan)/0.6)]" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-[hsl(var(--electric-cyan))] opacity-0 transition-opacity group-hover:opacity-100">
                  Begin verification
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="glass-panel rounded-2xl border border-[hsl(var(--electric-cyan)/0.2)] p-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--electric-cyan)/0.1)]">
            <LockKeyhole className="h-5 w-5 text-[hsl(var(--electric-cyan))]" aria-hidden="true" />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">
              Verification is required before client entitlements are activated
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Identity verification is required to access GEM Enterprise client services. Information is encrypted in transit and at rest, used for verification and compliance purposes, and routed into the existing KYC review process.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70">
              Keep your supporting documentation ready before you begin. Complex business, trust, and family-office submissions may require manual review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
