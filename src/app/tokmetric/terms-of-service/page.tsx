import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Scale, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "TokMetric Terms of Service",
  description:
    "Terms governing access to and use of the TokMetric authorized TikTok content operations product.",
  alternates: { canonical: "/tokmetric/terms-of-service" },
};

const toc = [
  ["acceptance", "1. Acceptance and Eligibility"],
  ["accounts", "2. Accounts and Authorization"],
  ["content", "3. Content and Rights"],
  ["approvals", "4. Human Approval and Controls"],
  ["platforms", "5. Third-Party Platforms"],
  ["prohibited", "6. Prohibited Use"],
  ["ads-shop", "7. Advertising and Commerce"],
  ["availability", "8. Availability and Results"],
  ["security", "9. Security Responsibilities"],
  ["suspension", "10. Suspension and Termination"],
  ["ownership", "11. Intellectual Property"],
  ["disclaimers", "12. Disclaimers"],
  ["liability", "13. Limitation of Liability"],
  ["indemnity", "14. Indemnification"],
  ["law", "15. Governing Terms"],
  ["changes", "16. Changes and Contact"],
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-white/65">{children}</div>
    </section>
  );
}

export default function TokMetricTermsPage() {
  return (
    <div className="min-h-screen bg-[#0d121b] text-white">
      <header className="border-b border-white/[0.08] bg-[#0a1018]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/tokmetric" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-cyan-300">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to TokMetric
          </Link>
          <div className="mt-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10">
              <Scale className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Public legal document
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">TokMetric Terms of Service</h1>
          <p className="mt-4 text-sm text-white/45">Effective and last updated: July 5, 2026</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 lg:sticky lg:top-24">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              Contents
            </div>
            <nav className="space-y-2">
              {toc.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="block text-xs leading-5 text-white/45 hover:text-cyan-300">
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 space-y-10">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5 text-sm leading-7 text-white/65">
            These Terms govern use of TokMetric, a product operated by GEM Cybersecurity & Monitoring Assist through the GEM Enterprise website. They supplement any separate written service agreement between GEM and the customer.
          </div>

          <Section id="acceptance" title="1. Acceptance and Eligibility">
            <p>
              By accessing or using TokMetric, you agree to these Terms and the TokMetric Privacy Policy. You must have legal capacity to enter into a binding agreement and authority to act for any organization or account you connect.
            </p>
            <p>
              TokMetric is intended for authorized business, creator, seller, affiliate, agency, and enterprise users. Access may be restricted based on role, approval, service availability, jurisdiction, platform permissions, or contractual status.
            </p>
          </Section>

          <Section id="accounts" title="2. Accounts and Authorization">
            <p>
              You may connect only TikTok accounts, business assets, shops, advertising accounts, or other resources that you own or are expressly authorized to manage. You must use approved OAuth or another officially supported authorization process.
            </p>
            <p>
              You are responsible for accurate registration information, protecting your own credentials and devices, reviewing permissions, and promptly revoking access when a user or representative is no longer authorized.
            </p>
            <p>
              TokMetric does not require you to provide TikTok passwords, browser cookies, or active login sessions. You must not place secrets, access tokens, refresh tokens, client secrets, or private keys into chats, public repositories, instructions, screenshots, or knowledge files.
            </p>
          </Section>

          <Section id="content" title="3. Content and Rights">
            <p>
              You remain responsible for the content, products, claims, offers, music, recordings, images, likenesses, trademarks, copyrights, captions, hashtags, links, and disclosures you submit or authorize for publication.
            </p>
            <p>
              You represent that you have all permissions, licenses, consents, releases, and legal rights required for the content and intended use. TokMetric may assist with preparation or review but does not transfer responsibility for legality, accuracy, ownership, or platform compliance.
            </p>
            <p>
              You grant GEM a limited right to host, process, transform, review, transmit, and display submitted materials only as needed to provide TokMetric and follow authorized instructions.
            </p>
          </Section>

          <Section id="approvals" title="4. Human Approval and Controls">
            <p>
              TokMetric may require compliance review, role-based approval, version locking, budget confirmation, commercial-content disclosure, or other controls before an external action is created.
            </p>
            <p>
              Approval applies only to the exact content version, settings, account, and action described in the approval request. Material changes may invalidate prior approval and require a new decision.
            </p>
            <p>
              Automation, assistants, and agents must not bypass required approval, emergency locks, permission checks, connector readiness, or policy evaluations.
            </p>
          </Section>

          <Section id="platforms" title="5. Third-Party Platforms">
            <p>
              TikTok, TikTok Shop, TikTok for Business, OpenAI, hosting providers, payment providers, and other integrations are independent third parties. Their own terms, policies, approval processes, permissions, rate limits, and technical availability apply.
            </p>
            <p>
              TokMetric is not endorsed by or affiliated with TikTok. TikTok names, products, and marks belong to their respective owners.
            </p>
            <p>
              We may change, limit, or discontinue an integration when necessary to comply with third-party requirements, protect security, address technical limitations, or prevent misuse.
            </p>
          </Section>

          <Section id="prohibited" title="6. Prohibited Use">
            <p>You must not use TokMetric to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>access or control an account without authorization;</li>
              <li>steal credentials, tokens, cookies, sessions, or personal information;</li>
              <li>scrape, evade rate limits, bypass restrictions, or interfere with platform security;</li>
              <li>create fake engagement, deceptive followers, automated spam, or coordinated manipulation;</li>
              <li>publish illegal, infringing, fraudulent, harmful, misleading, or prohibited material;</li>
              <li>conceal commercial relationships or required advertising disclosures;</li>
              <li>circumvent human approval, compliance checks, account permissions, or spending limits;</li>
              <li>misrepresent a failed, pending, private, or unconfirmed action as successfully completed.</li>
            </ul>
          </Section>

          <Section id="ads-shop" title="7. Advertising and Commerce">
            <p>
              Advertising spend, campaign budgets, billing, targeting, product claims, inventory, pricing, fulfillment, returns, taxes, customer support, seller obligations, and regulatory requirements remain the customer’s responsibility.
            </p>
            <p>
              TokMetric may require separate approval before creating or changing an advertisement, budget, product listing, shop setting, offer, or other financially significant action. The system does not guarantee approval by TikTok or any third party.
            </p>
          </Section>

          <Section id="availability" title="8. Availability and Results">
            <p>
              TokMetric may provide drafts, recommendations, workflow assistance, publishing preparation, status monitoring, and analytics based on available data. We do not guarantee views, followers, engagement, sales, revenue, ranking, platform approval, uninterrupted availability, or a particular business outcome.
            </p>
            <p>
              An external action is considered confirmed only when the connected service returns an appropriate success result. Processing, pending, rejected, failed, unavailable, or unknown statuses must not be treated as completion.
            </p>
          </Section>

          <Section id="security" title="9. Security Responsibilities">
            <p>
              You must maintain appropriate access controls, remove former personnel, protect devices and accounts, review audit history, use strong authentication, and report suspected misuse promptly.
            </p>
            <p>
              GEM may suspend connectors, revoke sessions, activate emergency locks, preserve logs, or limit actions when reasonably necessary to protect users, systems, third parties, or platform integrity.
            </p>
          </Section>

          <Section id="suspension" title="10. Suspension and Termination">
            <p>
              Access may be suspended or terminated for breach of these Terms, unauthorized activity, security risk, legal or platform requirements, nonpayment, misuse, repeated failed verification, or discontinuation of a required integration.
            </p>
            <p>
              Upon termination, authorization may be revoked and access disabled. Certain records may be retained for security, audit, compliance, dispute resolution, or legal purposes as described in the Privacy Policy.
            </p>
          </Section>

          <Section id="ownership" title="11. Intellectual Property">
            <p>
              GEM retains ownership of TokMetric software, workflows, interfaces, documentation, branding, and related technology, excluding customer content and third-party materials. No rights are granted except the limited right to use the service under these Terms and any applicable service agreement.
            </p>
          </Section>

          <Section id="disclaimers" title="12. Disclaimers">
            <p>
              TokMetric is provided on an “as available” basis to the fullest extent permitted by law. Automated outputs may contain errors and must be reviewed before use. Compliance checks are operational controls and are not legal advice, regulatory certification, or a guarantee that content or conduct is lawful or platform-compliant.
            </p>
          </Section>

          <Section id="liability" title="13. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, GEM will not be liable for indirect, incidental, special, exemplary, punitive, or consequential damages; lost profits, revenue, data, reputation, or opportunity; platform suspension; rejected content; or third-party service failure arising from use of TokMetric.
            </p>
            <p>
              Any liability that cannot lawfully be excluded will be limited as stated in the applicable customer agreement or, where no written agreement applies, to the amount paid for TokMetric during the three months preceding the event giving rise to the claim.
            </p>
          </Section>

          <Section id="indemnity" title="14. Indemnification">
            <p>
              To the extent permitted by law, you agree to defend, indemnify, and hold GEM and its personnel harmless from claims, losses, penalties, and expenses arising from your content, products, account activity, infringement, unlawful conduct, breach of these Terms, or unauthorized use of third-party services.
            </p>
          </Section>

          <Section id="law" title="15. Governing Terms">
            <p>
              Any signed customer agreement controls in the event of a conflict with these Terms. Otherwise, these Terms are governed by the law applicable to the GEM contracting entity, without regard to conflict-of-law rules, and disputes will be handled in the forum specified in the applicable agreement or required by law.
            </p>
            <p>
              If any provision is unenforceable, the remaining provisions remain effective. Failure to enforce a provision is not a waiver. You may not assign these Terms without GEM’s written consent; GEM may assign them as part of a reorganization, financing, or transfer of the service.
            </p>
          </Section>

          <Section id="changes" title="16. Changes and Contact">
            <p>
              We may update these Terms when the product, integrations, business requirements, or applicable rules change. The current version will be posted at this URL with a revised date. Continued use after an effective update constitutes acceptance where permitted by law.
            </p>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                Contact
              </div>
              <p>GEM Cybersecurity & Monitoring Assist — GEM Enterprise</p>
              <p>
                Email: <a className="text-cyan-300 hover:underline" href="mailto:compliance@gemcybersecurityassist.com">compliance@gemcybersecurityassist.com</a>
              </p>
              <p>Website: gemcybersecurityassist.com</p>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
