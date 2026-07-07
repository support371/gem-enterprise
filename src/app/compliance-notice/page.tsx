import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Compliance Notice",
  description:
    "Service eligibility, regulatory scope, verification, risk, and third-party disclosures for GEM Enterprise.",
};

const updatedAt = "July 7, 2026";

export default function ComplianceNoticePage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Badge
            variant="outline"
            className="mb-4 border-[hsl(var(--electric-cyan)/0.5)] text-xs font-medium uppercase tracking-widest text-[hsl(var(--electric-cyan))]"
          >
            Compliance Information
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-[hsl(var(--foreground))]">
            Compliance &amp; Service Notice
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Last updated: {updatedAt}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[hsl(var(--foreground)/0.7)]">
            This notice explains how service availability, eligibility, verification, and third-party
            delivery may apply across the GEM Enterprise platform. It does not replace a signed service
            agreement or professional legal advice.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl space-y-10 px-6 py-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Platform and Regulatory Scope
          </h2>
          <div className="space-y-4 leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            <p>
              GEM Enterprise presents cybersecurity, digital-security, operational-support, and related
              service interfaces. The availability and legal scope of a service depend on the service
              selected, the customer&apos;s location, the contracting entity, and any third-party provider
              involved.
            </p>
            <p>
              The website does not, by itself, represent that GEM Enterprise is a bank, broker-dealer,
              investment adviser, money transmitter, insurer, law firm, or government authority. Any
              service requiring a license, registration, authorization, or regulated third-party provider
              must be offered only after the applicable status and delivery arrangement have been verified
              and disclosed for that service.
            </p>
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm">
              Registration numbers, licensing details, and regulator references must not be inferred from
              general platform language. Where a regulated status applies, the relevant legal entity,
              jurisdiction, registration number, scope, and verification source should be provided in the
              applicable service documentation.
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Service Eligibility
          </h2>
          <div className="space-y-4 leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            <p>
              Public cybersecurity information and generally available security products do not require a
              person to be an accredited investor unless a specific service page and governing agreement
              state otherwise for a legitimate legal reason.
            </p>
            <p>
              Certain institutional, financial-security, asset-related, property, or jurisdiction-limited
              services may require identity verification, entity verification, eligibility review,
              contractual onboarding, or approval by a third-party provider before activation.
            </p>
            <p>
              Submission of an access request does not guarantee approval, service availability, pricing,
              or acceptance in a particular jurisdiction.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Identity, Entity, and Risk Review
          </h2>
          <div className="space-y-4 leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            <p>
              GEM Enterprise may request identity, organization, beneficial-ownership, sanctions, fraud,
              security, or source-of-funds information when required by the selected service, a provider,
              a contract, or applicable law. The scope of review should be proportionate to the service.
            </p>
            <p>
              Verification may be performed by approved third-party providers. Their own notices, terms,
              retention periods, geographic restrictions, and decisions may also apply. Sensitive identity
              documents should be submitted only through an approved secure verification workflow, not an
              ordinary contact form or email attachment unless specifically authorized.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Financial and Professional-Advice Disclaimer
          </h2>
          <div className="space-y-4 leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            <p>
              General platform content is informational. Unless a separate written agreement expressly
              states otherwise, it is not investment, legal, tax, accounting, insurance, or regulated
              financial advice and is not a recommendation to buy, sell, hold, transfer, or finance an
              asset.
            </p>
            <p>
              Users should perform independent due diligence and obtain advice from appropriately licensed
              professionals before making financial, legal, property, compliance, or security decisions.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Cybersecurity and Service Limitations
          </h2>
          <div className="space-y-4 leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            <p>
              No cybersecurity control eliminates all risk. Product descriptions, monitoring labels,
              response targets, availability statements, and status indicators are subject to the actual
              technical implementation and the applicable service agreement.
            </p>
            <p>
              A feature labelled preview, demonstration, planned, connected, or available must not be
              interpreted as a guarantee that it is operating as a continuously monitored production
              service. Contracted service levels, where offered, are defined separately.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Privacy and Third Parties
          </h2>
          <div className="space-y-4 leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            <p>
              GEM Enterprise does not sell personal information. Information may be processed or disclosed
              where needed to provide requested services, operate and secure the platform, conduct approved
              verification, prevent fraud, respond to lawful requests, or meet contractual and legal
              obligations, as further described in the Privacy Policy.
            </p>
            <p>
              Third-party products, identity-verification services, payment systems, analytics tools, and
              external links are governed by their own terms and privacy practices. Their inclusion does not
              by itself establish a regulatory partnership, endorsement, or agency relationship.
            </p>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Verification and Questions
          </h2>
          <p className="leading-relaxed text-[hsl(var(--foreground)/0.8)]">
            Before relying on a licensing, registration, partnership, certification, service-level, or
            geographic-availability statement, request the applicable current documentation through the
            official contact channel. Material public claims should be reviewed whenever the underlying
            evidence, provider, jurisdiction, or service changes.
          </p>
        </section>
      </main>
    </div>
  );
}
