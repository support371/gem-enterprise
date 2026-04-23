import Link from "next/link";
import { ShieldCheck, User, Building2, Landmark, Users } from "lucide-react";

const ENTITY_TYPES = [
  {
    id: "individual",
    label: "Individual",
    description: "For individual accredited investors seeking personal verification.",
    href: "/kyc/individual",
    icon: "User",
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
    icon: "Building2",
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
    icon: "Landmark",
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
    icon: "Users",
    requirements: [
      "Family office establishment documents",
      "Principal family member IDs",
      "Investment mandate disclosure",
    ],
  },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Building2,
  Landmark,
  Users,
};

export default function KYCStartPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/get-started"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
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

      {/* Heading */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-[hsl(var(--electric-cyan)/0.3)] text-[hsl(var(--electric-cyan))] text-xs font-mono uppercase tracking-wider mb-4">
          <ShieldCheck className="h-3 w-3" />
          Identity Verification
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Begin Your Verification
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-xl">
          To access GEM Enterprise client services, we are required to verify your identity
          in accordance with applicable anti-money laundering (AML) and know-your-customer
          (KYC) regulations. Select the entity type that best describes you.
        </p>
      </div>

      {/* Entity type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {ENTITY_TYPES.map((entity) => {
          const Icon = ICON_MAP[entity.icon];
          return (
            <Link
              key={entity.id}
              href={entity.href}
              className="group glass-panel rounded-2xl p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--electric-cyan)/0.5)] hover:shadow-[0_0_24px_hsl(var(--electric-cyan)/0.1)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))] focus:ring-offset-2 focus:ring-offset-background block"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--electric-cyan)/0.1)] group-hover:bg-[hsl(var(--electric-cyan)/0.15)] transition-colors mb-4">
                <Icon className="h-6 w-6 text-[hsl(var(--electric-cyan))]" aria-hidden="true" />
              </div>

              {/* Title + description */}
              <h2 className="font-semibold text-foreground mb-1.5 group-hover:text-[hsl(var(--electric-cyan))] transition-colors">
                {entity.label}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {entity.description}
              </p>

              {/* Typical requirements */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                  Typical Requirements
                </p>
                <ul className="space-y-1">
                  {entity.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-[hsl(var(--electric-cyan)/0.6)] flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA arrow */}
              <div className="mt-4 flex items-center gap-1 text-xs text-[hsl(var(--electric-cyan))] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Begin verification
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info box */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--electric-cyan)/0.2)] p-6 flex gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--electric-cyan)/0.1)]">
          <ShieldCheck className="h-5 w-5 text-[hsl(var(--electric-cyan))]" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-foreground mb-1 text-sm">
            KYC is Required for Client Access
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Identity verification is required to access all GEM Enterprise client services.
            Your information is{" "}
            <span className="text-foreground font-medium">encrypted in transit and at rest</span>,
            and is used solely for identity verification and regulatory compliance purposes.
            We do not sell or share your data with third parties except as required by
            applicable law.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            This process typically takes 10–15 minutes. Please have supporting documentation
            ready before you begin.
          </p>
        </div>
      </div>
    </div>
  );
}
