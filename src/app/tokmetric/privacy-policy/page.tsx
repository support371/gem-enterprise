import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Eye, FileText, LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "TokMetric Privacy Policy",
  description:
    "How GEM Cybersecurity & Monitoring Assist collects, uses, protects, and retains information for the TokMetric product.",
  alternates: { canonical: "/tokmetric/privacy-policy" },
};

const toc = [
  ["scope", "1. Scope"],
  ["information", "2. Information We Collect"],
  ["not-collected", "3. Information We Do Not Request"],
  ["use", "4. How We Use Information"],
  ["connections", "5. Connected Services and OAuth"],
  ["sharing", "6. Sharing and Disclosure"],
  ["retention", "7. Retention and Deletion"],
  ["rights", "8. Privacy Rights"],
  ["security", "9. Security"],
  ["children", "10. Children"],
  ["international", "11. International Processing"],
  ["changes", "12. Changes and Contact"],
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-white/65">{children}</div>
    </section>
  );
}

export default function TokMetricPrivacyPolicyPage() {
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
              <Eye className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Public legal document
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">TokMetric Privacy Policy</h1>
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
            TokMetric is operated by GEM Cybersecurity & Monitoring Assist through the GEM Enterprise website. This policy applies specifically to the TokMetric product and supplements the general GEM Enterprise Privacy Policy.
          </div>

          <Section id="scope" title="1. Scope">
            <p>
              This Privacy Policy explains how information is handled when users visit the TokMetric pages, request access, connect an authorized TikTok account, create content, submit approvals, publish through supported interfaces, or review analytics and audit records.
            </p>
          </Section>

          <Section id="information" title="2. Information We Collect">
            <p>
              We may collect account and contact information such as name, business email, organization, role, workspace membership, and support communications.
            </p>
            <p>
              Operational records may include campaigns, scripts, captions, hashtags, content drafts, uploaded media references, media versions, compliance reviews, approval requests, approval decisions, publishing jobs, connector status, analytics snapshots, and audit events.
            </p>
            <p>
              When a user authorizes TikTok access, we may receive the profile, account identifiers, public or authorized content information, permitted analytics, publishing status, and other information covered by the scopes the user approves. Access depends on TikTok product approval, user authorization, and platform availability.
            </p>
            <p>
              We may also collect technical information such as IP address, browser, device type, timestamps, request logs, security events, error details, and activity needed to protect and operate the service.
            </p>
          </Section>

          <Section id="not-collected" title="3. Information We Do Not Request">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-emerald-200">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Credential protection
              </div>
              <p>
                TokMetric does not ask users to provide TikTok passwords, browser cookies, active login sessions, or authentication codes in chat, forms, instructions, or knowledge files. Access tokens, refresh tokens, client secrets, and private API keys must not be shown in the user interface or returned through assistant actions.
              </p>
            </div>
          </Section>

          <Section id="use" title="4. How We Use Information">
            <p>
              Information is used to manage accounts and workspaces; prepare and version content; run compliance and policy checks; support human approval; create and monitor publishing jobs; provide authorized analytics; maintain audit history; detect abuse or security incidents; troubleshoot failures; and comply with applicable contractual or legal obligations.
            </p>
            <p>
              We do not treat a requested action as successfully completed unless the connected service returns a confirmed result. Failed, pending, rejected, unavailable, or incomplete actions may remain in operational records for security and audit purposes.
            </p>
          </Section>

          <Section id="connections" title="5. Connected Services and OAuth">
            <p>
              TokMetric may interact with TikTok, TikTok Shop, TikTok for Business, OpenAI Custom GPT Actions, hosting providers, storage providers, email or support services, and other infrastructure needed to operate the product.
            </p>
            <p>
              Connected accounts must use approved OAuth or another officially supported authorization method. Tokens and secrets are stored in protected backend systems and are not intended to be exposed to users, assistants, logs, screenshots, public code, or client-side pages.
            </p>
            <p>
              Users can revoke authorization through supported platform controls. Revocation may stop future access but may not automatically delete records that must be retained for security, audit, dispute, or legal purposes.
            </p>
          </Section>

          <Section id="sharing" title="6. Sharing and Disclosure">
            <p>
              We do not sell personal information. Information may be shared with service providers that help operate TokMetric, with connected platforms when the user requests an authorized action, with professional advisers under confidentiality obligations, or with authorities when disclosure is legally required.
            </p>
            <p>
              Service providers are expected to process information only for the operational purpose for which it was supplied and subject to appropriate contractual and security controls.
            </p>
          </Section>

          <Section id="retention" title="7. Retention and Deletion">
            <p>
              We retain information only for as long as reasonably necessary for service delivery, security, fraud prevention, compliance, audit, dispute resolution, and enforcement. Retention periods vary by record type and applicable requirements.
            </p>
            <p>
              Users may request disconnection or deletion. Some records, including approvals, audit logs, security events, transaction history, and evidence of user instructions, may be retained where required or reasonably necessary.
            </p>
          </Section>

          <Section id="rights" title="8. Privacy Rights">
            <p>
              Depending on location, users may have rights to request access, correction, deletion, restriction, objection, portability, or withdrawal of consent. We may need to verify identity and authority before acting on a request.
            </p>
            <p>
              Privacy requests may be sent to <a className="text-cyan-300 hover:underline" href="mailto:compliance@gemcybersecurityassist.com">compliance@gemcybersecurityassist.com</a>.
            </p>
          </Section>

          <Section id="security" title="9. Security">
            <p>
              TokMetric uses measures designed to protect information, including encrypted transport, protected secret storage, access controls, role-based permissions, approval controls, audit logging, monitoring, rate limits, incident response, and emergency suspension capabilities.
            </p>
            <p>
              No system can guarantee absolute security. Users are responsible for protecting their own devices, email accounts, company credentials, and authorized sessions.
            </p>
          </Section>

          <Section id="children" title="10. Children">
            <p>
              TokMetric is intended for authorized business users and is not directed to children below the minimum age required to use the service or connected platforms. We do not knowingly seek personal information from children for TokMetric operations.
            </p>
          </Section>

          <Section id="international" title="11. International Processing">
            <p>
              Information may be processed in countries where GEM Enterprise or its service providers operate. Where required, we use contractual, organizational, and technical safeguards appropriate to the transfer and processing context.
            </p>
          </Section>

          <Section id="changes" title="12. Changes and Contact">
            <p>
              We may update this policy as the product, integrations, or legal requirements change. The current version will be published at this URL with a revised date.
            </p>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                Privacy contact
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
