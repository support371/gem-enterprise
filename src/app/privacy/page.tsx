import Link from "next/link";
import { Shield, Eye, Lock, CheckCircle, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Privacy Policy | GEM Enterprise",
  description:
    "GEM Enterprise Privacy Policy — how we collect, use, and protect your personal information.",
};

const tocItems = [
  { id: "information-we-collect", label: "1. Information We Collect" },
  { id: "how-we-use", label: "2. How We Use Information" },
  { id: "information-sharing", label: "3. Information Sharing" },
  { id: "data-security", label: "4. Data Security" },
  { id: "data-retention", label: "5. Data Retention" },
  { id: "your-rights", label: "6. Your Rights" },
  { id: "cookies", label: "7. Cookies & Tracking Technologies" },
  { id: "international-transfers", label: "8. International Data Transfers" },
  { id: "childrens-privacy", label: "9. Children's Privacy" },
  { id: "contact", label: "10. Contact for Privacy Matters" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
              <Eye className="h-5 w-5" />
            </div>
            <Badge className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)] font-mono text-xs tracking-widest uppercase px-3 py-1">
              Legal Document
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            Privacy Policy
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <span>Effective Date: January 1, 2026</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>Last Updated: January 1, 2026</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents — sticky sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-8 bg-[hsl(var(--card)/0.5)] border border-[hsl(var(--border))] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Table of Contents
                </span>
              </div>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] py-1 transition-colors leading-relaxed"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <Separator className="my-4 border-[hsl(var(--border))]" />
              <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-2">
                <p>Questions about this policy?</p>
                <a
                  href="mailto:compliance@gem-enterprise.com"
                  className="text-[hsl(var(--primary))] hover:underline break-all"
                >
                  compliance@gem-enterprise.com
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12 min-w-0">
            {/* Introduction */}
            <section>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed text-base">
                GEM Enterprise (&quot;GEM Enterprise,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
                the privacy and security of your personal information. This Privacy Policy describes how
                we collect, use, disclose, and safeguard information obtained through our platform,
                services, and related digital properties (collectively, the &quot;Platform&quot;). By accessing
                or using the Platform, you acknowledge that you have read, understood, and agree to the
                practices described in this Policy. This Policy applies to all users of the Platform,
                including prospective clients, registered clients, and authorized personnel accessing
                the Platform on behalf of an institutional entity.
              </p>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 1 */}
            <section id="information-we-collect" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                1. Information We Collect
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                We collect several categories of information in order to deliver and improve our
                services, maintain regulatory compliance, and protect the security of our Platform
                and clients.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    1.1 Personal Information
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    We collect personally identifiable information that you voluntarily provide when
                    registering for or using our Platform. This includes, but is not limited to: full
                    legal name, email address, phone number, mailing address, date of birth,
                    government-issued identification numbers, and professional credentials or
                    affiliations. We may also collect information about authorized representatives
                    acting on behalf of institutional clients.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    1.2 Usage Data
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    When you access or interact with the Platform, we automatically collect certain
                    technical and behavioral data. This includes IP addresses, browser type and version,
                    operating system, device identifiers, pages visited, time spent on pages, links
                    clicked, referring URLs, session timestamps, and interaction logs. This data is used
                    to maintain platform security, monitor for anomalous behavior, and improve service
                    quality.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    1.3 KYC and Verification Data
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    As part of our regulatory obligations, we collect Know Your Customer (KYC) and
                    identity verification information. This includes copies of government-issued
                    identification documents (passport, national ID, driver&apos;s license), proof of
                    address documentation, biometric verification data where applicable, accreditation
                    or qualification documentation, source of funds and wealth information, and
                    beneficial ownership declarations for institutional clients. This data is processed
                    in strict accordance with applicable anti-money laundering (AML) regulations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    1.4 Financial Information
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    To facilitate service delivery, we may collect financial information including
                    banking institution details, account numbers (stored in tokenized format),
                    investment history and portfolio information, transaction records, net worth and
                    income declarations relevant to accreditation verification, and tax identification
                    numbers where required by law. Financial data is handled with the highest level of
                    security controls and is subject to strict access restrictions.
                  </p>
                </div>
              </div>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 2 */}
            <section id="how-we-use" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                2. How We Use Your Data
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                GEM Enterprise processes personal information for specific, defined purposes. We do
                not process data beyond what is necessary to fulfill these purposes.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    2.1 Service Delivery
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    We use collected information to create and manage your account, provide access to
                    platform features and services, process transactions and requests, respond to
                    inquiries and support requests, and personalize your experience within the Platform.
                    Service delivery represents the primary lawful basis for our data processing
                    activities.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    2.2 KYC/AML Verification
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    We process identity and verification data to satisfy our legal obligations under
                    applicable KYC and AML regulations, verify that clients meet eligibility
                    requirements (including accreditation standards), screen against sanctions and
                    watchlists maintained by regulatory authorities, and conduct ongoing due diligence
                    as required by law.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    2.3 Compliance and Legal Obligations
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    We process and retain information as necessary to comply with applicable laws,
                    regulations, and regulatory directives; respond to legal process and government
                    requests; maintain records as required by financial services regulations; and
                    cooperate with law enforcement and regulatory investigations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    2.4 Platform Security
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    Usage data and access logs are processed to detect and prevent fraud, unauthorized
                    access, and other security threats; monitor platform integrity and system health;
                    investigate security incidents; and enforce our Terms of Service and acceptable use
                    policies.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    2.5 Communications
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    We use contact information to send transactional communications related to your
                    account, provide notices of material changes to our policies or services, deliver
                    security alerts and notifications, and — where you have provided consent — send
                    service-related updates and information relevant to your client relationship.
                  </p>
                </div>
              </div>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 3 */}
            <section id="information-sharing" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                3. Data Sharing
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                GEM Enterprise does not sell, rent, or trade your personal information to third
                parties for commercial purposes. We do not engage in data brokerage activities.
                Disclosure of your information is limited to the circumstances described below.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    3.1 Regulatory Bodies
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    We are required by law to share information with relevant regulatory and
                    governmental authorities. This includes disclosures to financial regulators, tax
                    authorities, law enforcement agencies acting pursuant to valid legal process, and
                    any other governmental body with lawful authority to request such information. Such
                    disclosures are made only to the extent required by applicable law.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    3.2 KYC Verification Partners
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    We engage accredited third-party identity verification and KYC service providers to
                    assist in fulfilling our compliance obligations. These providers operate under
                    strict non-disclosure agreements (NDAs) and data processing agreements that prohibit
                    them from using your information for any purpose other than providing services to
                    GEM Enterprise. All KYC partners are vetted for compliance with applicable data
                    protection standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    3.3 Security Monitoring Partners
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    To maintain the security of the Platform and protect client assets, we may share
                    technical and usage data with security operations and threat intelligence partners.
                    Such sharing is limited to data necessary for security purposes and is governed by
                    appropriate contractual protections. Security partners are prohibited from using
                    data for any commercial purpose.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">
                    3.4 Business Transfers
                  </h3>
                  <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                    In the event of a merger, acquisition, reorganization, or sale of all or
                    substantially all of our assets, your personal information may be transferred to
                    the acquiring entity. We will provide notice of such transfer and require the
                    recipient to comply with this Privacy Policy or provide you with an opportunity to
                    opt out of material changes to data handling practices.
                  </p>
                </div>
              </div>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 4 */}
            <section id="data-security" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                4. Data Security
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                We implement a comprehensive, defense-in-depth security program to protect your
                information against unauthorized access, disclosure, alteration, and destruction.
              </p>
              <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                <p>
                  <strong className="text-[hsl(var(--foreground))]">Encryption Standards:</strong>{" "}
                  All data in transit is protected using TLS 1.3 or higher. Data at rest is encrypted
                  using AES-256 encryption. Sensitive credentials and authentication tokens are stored
                  using industry-standard cryptographic hashing algorithms.
                </p>
                <p>
                  <strong className="text-[hsl(var(--foreground))]">Access Controls:</strong>{" "}
                  Access to personal data is restricted on a strict need-to-know basis. We employ
                  role-based access control (RBAC), multi-factor authentication for all administrative
                  access, privileged access management (PAM) controls, and regular access reviews and
                  certifications.
                </p>
                <p>
                  <strong className="text-[hsl(var(--foreground))]">Security Monitoring:</strong>{" "}
                  We maintain continuous security monitoring through a Security Operations Center (SOC),
                  including intrusion detection and prevention systems, security information and event
                  management (SIEM), and regular third-party penetration testing and security audits.
                </p>
                <p>
                  <strong className="text-[hsl(var(--foreground))]">Incident Response:</strong>{" "}
                  We maintain a documented incident response plan tested on a regular basis. In the
                  event of a data breach that affects your rights and freedoms, we will notify affected
                  individuals and relevant supervisory authorities in accordance with applicable law,
                  within the timeframes required by applicable data protection regulations.
                </p>
              </div>
              <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                No method of data transmission or storage can be guaranteed to be 100% secure. You
                are responsible for maintaining the confidentiality of your account credentials and
                for any activity that occurs under your account.
              </p>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 5 */}
            <section id="data-retention" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                5. Data Retention
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                We retain personal information only for as long as necessary to fulfill the purposes
                for which it was collected, comply with legal obligations, resolve disputes, and
                enforce our agreements. Retention periods vary by data category:
              </p>
              <ul className="space-y-3 text-[hsl(var(--foreground)/0.75)] leading-relaxed list-none">
                {[
                  {
                    label: "Account Data",
                    detail:
                      "Retained for the duration of the client relationship and for a minimum of seven (7) years following account closure, in accordance with financial services recordkeeping requirements.",
                  },
                  {
                    label: "KYC/AML Records",
                    detail:
                      "Retained for a minimum of five (5) to ten (10) years following the conclusion of the business relationship, as required by applicable anti-money laundering regulations.",
                  },
                  {
                    label: "Transaction Records",
                    detail:
                      "Retained for a minimum of seven (7) years as required by financial regulations and applicable tax laws.",
                  },
                  {
                    label: "Usage & Access Logs",
                    detail:
                      "Retained for up to twelve (12) months for security monitoring purposes, and longer where required for active legal proceedings or regulatory investigations.",
                  },
                  {
                    label: "Communications",
                    detail:
                      "Retained for a period determined by the nature of the communication and applicable legal requirements, typically three (3) to seven (7) years.",
                  },
                ].map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <span className="text-[hsl(var(--primary))] font-medium min-w-fit">
                      {item.label}:
                    </span>
                    <span>{item.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                Upon expiration of the applicable retention period, data is securely deleted or
                anonymized in accordance with our data destruction procedures, which comply with
                recognized standards for secure data disposal.
              </p>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 6 */}
            <section id="your-rights" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                6. Your Rights
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                Subject to applicable law and regulatory requirements, you may have certain rights
                with respect to your personal information. Please note that these rights may be
                limited or restricted where we are required to retain data to comply with legal
                obligations.
              </p>
              <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                {[
                  {
                    right: "Right of Access",
                    desc: "You may request a copy of the personal information we hold about you, along with information about how we process that data, the purposes of processing, and the categories of recipients to whom data is disclosed.",
                  },
                  {
                    right: "Right to Correction",
                    desc: "You may request that we correct inaccurate or incomplete personal information. We will take reasonable steps to verify the accuracy of requested corrections before implementing them.",
                  },
                  {
                    right: "Right to Deletion",
                    desc: "You may request deletion of your personal information. This right is subject to our legal and regulatory retention obligations, which may require us to retain certain data regardless of deletion requests.",
                  },
                  {
                    right: "Right to Portability",
                    desc: "Where technically feasible and legally permissible, you may request that we provide your personal data in a structured, commonly used, machine-readable format suitable for transmission to another controller.",
                  },
                  {
                    right: "Right to Object",
                    desc: "You may object to the processing of your personal information where we are relying on a legitimate interest as the legal basis for processing. We will cease processing unless we can demonstrate compelling legitimate grounds that override your interests.",
                  },
                  {
                    right: "Right to Withdraw Consent",
                    desc: "Where processing is based on your consent, you may withdraw consent at any time without affecting the lawfulness of processing carried out prior to withdrawal.",
                  },
                ].map((item) => (
                  <p key={item.right}>
                    <strong className="text-[hsl(var(--foreground))]">{item.right}:</strong>{" "}
                    {item.desc}
                  </p>
                ))}
              </div>
              <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                To exercise any of these rights, please submit a written request to{" "}
                <a
                  href="mailto:compliance@gem-enterprise.com"
                  className="text-[hsl(var(--primary))] underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  compliance@gem-enterprise.com
                </a>
                . We will respond within the timeframe required by applicable law, typically within
                thirty (30) days of receipt. We may require verification of your identity before
                processing a rights request.
              </p>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 7 */}
            <section id="cookies" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                7. Cookies &amp; Tracking Technologies
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                GEM Enterprise employs a minimal approach to cookies and tracking technologies,
                limited to those strictly necessary for the operation and security of the Platform.
              </p>
              <div className="space-y-4 text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                <p>
                  <strong className="text-[hsl(var(--foreground))]">Essential Cookies:</strong>{" "}
                  We use session cookies that are strictly necessary for Platform functionality,
                  including authentication state management, CSRF protection, and load balancing.
                  These cookies are not used for tracking or advertising purposes and cannot be
                  disabled without impairing Platform functionality.
                </p>
                <p>
                  <strong className="text-[hsl(var(--foreground))]">Session Management:</strong>{" "}
                  Session cookies expire upon browser closure or after a defined period of inactivity
                  for security purposes. Persistent cookies, where used, are limited to preference
                  storage necessary for Platform functionality and have defined expiry periods.
                </p>
                <p>
                  <strong className="text-[hsl(var(--foreground))]">Analytics:</strong>{" "}
                  Where analytics tools are used, they are configured to anonymize IP addresses and
                  are subject to data processing agreements that restrict use to aggregate statistical
                  analysis. We do not use analytics data for individual profiling.
                </p>
              </div>
              <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                We do not use third-party advertising cookies, social media tracking pixels, or
                behavioral profiling technologies. You may configure your browser to block cookies,
                but doing so may impair the functionality of the Platform.
              </p>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 8 */}
            <section id="international-transfers" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                8. International Data Transfers
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                GEM Enterprise operates globally and may transfer personal information across
                international borders in connection with the delivery of our services. We take
                appropriate safeguards to ensure that such transfers comply with applicable data
                protection laws.
              </p>
              <p className="text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                Where personal data is transferred from the European Economic Area (EEA), United
                Kingdom, or other jurisdictions with data transfer restrictions to countries that
                have not been determined to provide an adequate level of data protection, we implement
                appropriate safeguards such as Standard Contractual Clauses (SCCs) approved by
                relevant data protection authorities, binding corporate rules where applicable, or
                other lawful transfer mechanisms recognized under applicable law. By using the
                Platform, you acknowledge that your information may be transferred to and processed
                in countries outside your jurisdiction of residence.
              </p>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 9 */}
            <section id="childrens-privacy" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                9. Children&apos;s Privacy
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                The GEM Enterprise Platform is intended exclusively for adult users who meet our
                eligibility requirements, including accreditation and qualification standards. The
                Platform is not directed to, and we do not knowingly collect personal information
                from, individuals under the age of eighteen (18). If we become aware that we have
                inadvertently collected personal information from a minor, we will take prompt steps
                to delete such information from our systems. If you believe we have collected
                information from a minor, please contact us immediately at{" "}
                <a
                  href="mailto:compliance@gem-enterprise.com"
                  className="text-[hsl(var(--primary))] underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  compliance@gem-enterprise.com
                </a>
                .
              </p>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Section 10 */}
            <section id="contact" className="space-y-4 scroll-mt-8">
              <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                10. Contact for Privacy Matters
              </h2>
              <p className="text-[hsl(var(--foreground)/0.85)] leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                our data processing practices, please contact our compliance team. We are committed
                to resolving privacy concerns in a timely and transparent manner.
              </p>
              <div className="bg-[hsl(var(--card)/0.7)] border border-[hsl(var(--border))] rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <p className="font-semibold text-[hsl(var(--foreground))]">
                    GEM Enterprise Compliance &amp; Privacy Team
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-mono mb-1 text-[hsl(var(--foreground)/0.5)]">
                      Email
                    </p>
                    <a
                      href="mailto:compliance@gem-enterprise.com"
                      className="text-[hsl(var(--primary))] underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      compliance@gem-enterprise.com
                    </a>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-mono mb-1 text-[hsl(var(--foreground)/0.5)]">
                      Privacy Rights Requests
                    </p>
                    <a
                      href="mailto:privacy@gem-enterprise.com"
                      className="text-[hsl(var(--primary))] underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      privacy@gem-enterprise.com
                    </a>
                  </div>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Response time: We aim to respond to all privacy inquiries within five (5) business
                  days. Rights requests will be processed within the timeframe required by applicable
                  law.
                </p>
              </div>
            </section>

            <Separator className="border-[hsl(var(--border))]" />

            {/* Footer */}
            <section className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.15)]">
                <CheckCircle className="h-4 w-4 text-[hsl(var(--primary))] mt-0.5 shrink-0" />
                <p className="text-sm text-[hsl(var(--foreground)/0.75)] leading-relaxed">
                  This policy is subject to change with notice. Material changes will be communicated
                  to registered users via email or prominent notice on the Platform no less than thirty
                  (30) days prior to the effective date of such changes. Your continued use of the
                  Platform following notice of changes constitutes acceptance of the revised Policy.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                <Link
                  href="/terms"
                  className="text-[hsl(var(--primary))] hover:underline underline-offset-2 transition-colors"
                >
                  Terms of Service
                </Link>
                <span className="hidden sm:inline">&middot;</span>
                <Link
                  href="/compliance-notice"
                  className="text-[hsl(var(--primary))] hover:underline underline-offset-2 transition-colors"
                >
                  Compliance Notice
                </Link>
                <span className="hidden sm:inline">&middot;</span>
                <Link
                  href="/contact"
                  className="text-[hsl(var(--primary))] hover:underline underline-offset-2 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
