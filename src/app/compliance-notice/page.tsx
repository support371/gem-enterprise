import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Compliance Notice" };

export default function ComplianceNoticePage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="outline"
              className="border-[hsl(var(--electric-cyan)/0.5)] text-[hsl(var(--electric-cyan))] text-xs font-medium uppercase tracking-widest"
            >
              Regulatory
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            Compliance &amp; Regulatory Notice
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <span>Last updated: January 1, 2026</span>
            <span className="hidden sm:inline">·</span>
            <span>Effective Date: January 1, 2026</span>
          </div>
          <p className="mt-4 text-[hsl(var(--foreground)/0.7)] text-sm leading-relaxed max-w-2xl">
            This Compliance and Regulatory Notice is provided for informational purposes and to fulfill
            GEM Enterprise&apos;s regulatory disclosure obligations. Clients and prospective clients should
            read this notice carefully before engaging with the Platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Regulatory Status */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Regulatory Status
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise operates as a cybersecurity-first enterprise platform providing services
            to qualified institutional and individual clients. Our regulatory position reflects the
            nature of the services provided and the jurisdictions in which we operate.
          </p>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 space-y-4">
            <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
              <strong className="text-[hsl(var(--foreground))]">Platform Registration:</strong>{" "}
              GEM Enterprise maintains applicable registrations and authorizations as required by
              the laws and regulations of the jurisdictions in which it operates. Specific registration
              details, license numbers, and regulatory filings are available upon request from our
              compliance team. [Regulatory registration details — placeholder for jurisdiction-specific
              disclosures.]
            </p>
            <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
              <strong className="text-[hsl(var(--foreground))]">Regulatory Oversight:</strong>{" "}
              GEM Enterprise is subject to oversight by relevant regulatory authorities in its operating
              jurisdictions. We maintain compliance programs designed to satisfy the requirements of
              applicable financial services, data protection, and cybersecurity regulations. [Specific
              regulatory authority disclosures — placeholder.]
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Note: Regulatory registrations and authorizations are subject to ongoing maintenance and
              may change. Clients are encouraged to verify current regulatory status directly with
              applicable regulatory authorities.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* AML/KYC Policy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Anti-Money Laundering (AML) and KYC Policy
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise maintains a comprehensive Anti-Money Laundering and Know Your Customer
            program in accordance with applicable laws and regulations, including applicable provisions
            of the Bank Secrecy Act, Financial Action Task Force (FATF) recommendations, and equivalent
            regulations in relevant jurisdictions.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <p>
              <strong className="text-[hsl(var(--foreground))]">Client Identification Program:</strong>{" "}
              All clients are required to complete identity verification prior to accessing the Platform.
              This includes collection and verification of identifying information, government-issued
              identification documents, proof of address, and beneficial ownership information for
              entity clients. Identity verification is conducted using reliable, independent source
              documents, data, or information.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Ongoing Due Diligence:</strong>{" "}
              We conduct ongoing customer due diligence throughout the client relationship, including
              monitoring of transactions and activities for unusual patterns, periodic review and
              re-verification of client information, and enhanced due diligence for higher-risk clients
              and relationships.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Sanctions Screening:</strong>{" "}
              All clients and transactions are screened against applicable sanctions lists, including
              those maintained by OFAC, the EU, the UN Security Council, and other relevant authorities.
              We do not conduct business with sanctioned persons, entities, or jurisdictions.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Suspicious Activity:</strong>{" "}
              GEM Enterprise maintains policies and procedures for identifying and reporting suspicious
              activity to relevant authorities as required by law. Clients are prohibited from engaging
              in any activity that constitutes, facilitates, or conceals money laundering, terrorist
              financing, or other financial crimes.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Client Classification */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Client Classification
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise classifies clients in accordance with applicable regulatory frameworks to
            ensure appropriate service delivery, disclosure standards, and regulatory treatment.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-5">
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Professional Clients / Institutional Investors</h3>
              <p>
                Entities and individuals who meet the criteria for classification as professional clients
                or institutional investors under applicable regulatory frameworks. This includes regulated
                financial institutions, large corporate clients meeting prescribed financial thresholds,
                government entities, and individuals who satisfy accreditation or professional investor
                standards. Professional clients receive the standard level of investor protection
                available under applicable law.
              </p>
            </div>
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-5">
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Qualified Eligible Persons</h3>
              <p>
                Individuals and entities who satisfy the definition of &quot;qualified eligible person&quot; or
                equivalent designation under applicable regulations, including accredited investors
                meeting financial thresholds and sophistication standards established by relevant
                regulatory authorities.
              </p>
            </div>
            <p className="text-sm">
              GEM Enterprise does not provide services to retail clients as defined under applicable
              financial services regulations. If your classification changes or you have questions
              about your client classification, please contact our compliance team.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Investment Risk Disclaimer */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Investment Risk Disclaimer
          </h2>
          <div className="bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.3)] rounded-lg p-6">
            <p className="text-[hsl(var(--foreground)/0.9)] leading-relaxed font-medium mb-3">
              IMPORTANT RISK WARNING
            </p>
            <div className="space-y-3 text-[hsl(var(--foreground)/0.75)] leading-relaxed text-sm">
              <p>
                The services and information available through the GEM Enterprise Platform involve
                significant risks. The value of investments and financial instruments can decrease as
                well as increase, and you may not recover the full amount invested. Past performance is
                not a reliable indicator of future results.
              </p>
              <p>
                Cybersecurity services and associated threat intelligence information are provided based
                on available data and analysis, which may be incomplete or subject to rapid change.
                GEM Enterprise does not warrant that its security services will prevent all security
                incidents or eliminate all cyber risks.
              </p>
              <p>
                Before making any financial or operational decisions based on information obtained
                through the Platform, you should conduct your own independent due diligence and, where
                appropriate, seek advice from qualified legal, financial, tax, and cybersecurity
                professionals.
              </p>
              <p>
                GEM Enterprise does not provide investment advice, legal advice, or tax advice. Nothing
                on the Platform should be construed as a recommendation to buy, sell, or hold any
                financial instrument or to take any particular course of action.
              </p>
            </div>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Jurisdictional Restrictions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Jurisdictional Restrictions
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            The Platform and services offered by GEM Enterprise are not available in all jurisdictions.
            Certain regulatory, legal, and sanctions-based restrictions limit our ability to serve
            clients in specific countries and regions.
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            The Platform is not available to persons or entities located in, organized under the laws
            of, or ordinarily resident in countries or territories that are subject to comprehensive
            international sanctions, including those designated by the U.S. Office of Foreign Assets
            Control (OFAC), European Union restrictive measures, UN Security Council sanctions, or
            equivalent regimes. Additionally, the Platform may be restricted in jurisdictions where
            applicable licensing, registration, or regulatory approval has not been obtained.
          </p>
          <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            It is your sole responsibility to ensure that your access to and use of the Platform complies
            with all laws applicable in your jurisdiction, including any requirements to obtain local
            regulatory approvals or licenses. GEM Enterprise makes no representation that the Platform
            or its services are appropriate for or available to persons in all jurisdictions. Access
            to the Platform from jurisdictions where its contents are illegal is prohibited.
          </p>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Conflicts of Interest */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Conflicts of Interest Policy
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise maintains a Conflicts of Interest Policy designed to identify, manage, and
            mitigate conflicts of interest that may arise in connection with the delivery of our services.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <p>
              We have implemented organizational and administrative arrangements to prevent conflicts
              of interest from adversely affecting the interests of our clients. These arrangements
              include information barriers between business units, disclosure policies for material
              conflicts, and oversight by our compliance function.
            </p>
            <p>
              Where conflicts of interest cannot be adequately managed through these arrangements, we
              will disclose the nature of such conflicts to affected clients before providing relevant
              services. Material conflicts of interest will be disclosed in writing and clients will
              have the opportunity to make an informed decision regarding the engagement.
            </p>
            <p>
              Employees and representatives of GEM Enterprise are required to report potential conflicts
              of interest and are subject to policies governing personal trading, outside business
              activities, and the receipt of gifts and entertainment.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Reporting Obligations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Reporting Obligations
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise is subject to various regulatory reporting obligations and maintains the
            systems and processes necessary to fulfill these commitments.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <p>
              <strong className="text-[hsl(var(--foreground))]">Financial Crime Reporting:</strong>{" "}
              We are legally required to report suspicious activity, money laundering, terrorist
              financing, and other financial crimes to relevant authorities. Client confidentiality
              does not protect information that must be disclosed under applicable law, and we may
              be prohibited from informing clients of such disclosures (so-called &quot;tipping off&quot;
              restrictions).
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Regulatory Examinations:</strong>{" "}
              GEM Enterprise is subject to examination by regulatory authorities and may be required
              to produce client records, account information, and other documentation in connection
              with such examinations. We cooperate fully with regulatory examinations and investigations.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Incident Reporting:</strong>{" "}
              Material cybersecurity incidents affecting the Platform are subject to reporting to relevant
              regulatory authorities and, where required, notification to affected clients, in accordance
              with applicable cybersecurity incident reporting rules and data breach notification laws.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Data Protection Compliance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Data Protection Compliance
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            GEM Enterprise is committed to compliance with applicable data protection and privacy laws,
            including the General Data Protection Regulation (GDPR), the California Consumer Privacy
            Act (CCPA) and California Privacy Rights Act (CPRA), and equivalent legislation in other
            jurisdictions.
          </p>
          <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
            <p>
              <strong className="text-[hsl(var(--foreground))]">GDPR Compliance:</strong>{" "}
              For clients and data subjects in the European Economic Area and United Kingdom, GEM
              Enterprise processes personal data in accordance with GDPR requirements. We maintain
              a lawful basis for all processing activities, implement data subject rights procedures,
              conduct data protection impact assessments where required, and maintain records of
              processing activities. Our Data Protection Officer can be contacted through our
              compliance team.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">CCPA/CPRA Compliance:</strong>{" "}
              California residents have rights under the CCPA and CPRA, including the right to know
              about personal information collected, the right to delete personal information, the
              right to opt out of the sale or sharing of personal information, and the right to
              non-discrimination for exercising privacy rights. GEM Enterprise does not sell personal
              information. To exercise your rights, please contact{" "}
              <a
                href="mailto:compliance@gemcybersecurityassist.com"
                className="text-[hsl(var(--electric-cyan))] underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                compliance@gemcybersecurityassist.com
              </a>
              .
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))]">Data Retention and Deletion:</strong>{" "}
              We retain personal data only for as long as necessary to fulfill the purposes for which
              it was collected, including satisfaction of legal, regulatory, and contractual obligations.
              Our data retention schedules are reviewed periodically to ensure compliance with applicable
              requirements.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Contact Compliance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
            Contact the Compliance Team
          </h2>
          <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
            For compliance-related inquiries, regulatory questions, data protection requests, or to
            report concerns regarding potential violations of applicable law or GEM Enterprise policy,
            please contact our compliance team directly.
          </p>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 space-y-2">
            <p className="font-medium text-[hsl(var(--foreground))]">GEM Enterprise Compliance Department</p>
            <a
              href="mailto:compliance@gemcybersecurityassist.com"
              className="text-[hsl(var(--electric-cyan))] underline underline-offset-2 hover:opacity-80 transition-opacity block"
            >
              compliance@gemcybersecurityassist.com
            </a>
            <p className="text-sm text-[hsl(var(--muted-foreground))] pt-2">
              Our compliance team endeavors to respond to all inquiries within five (5) business days.
              For urgent regulatory matters, please indicate the urgency in your subject line.
            </p>
          </div>
        </section>

        <Separator className="border-[hsl(var(--border))]" />

        {/* Footer */}
        <section>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed italic">
            This Compliance and Regulatory Notice is provided for informational purposes only and does
            not constitute legal advice. GEM Enterprise reserves the right to update this notice to
            reflect changes in applicable laws, regulations, or our compliance program. The most current
            version of this notice will be maintained on the Platform. Clients are encouraged to review
            this notice periodically.
          </p>
        </section>
      </div>
    </div>
  );
}
