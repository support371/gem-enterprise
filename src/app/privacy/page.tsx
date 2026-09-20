import Link from "next/link";
import { Eye, FileText, Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Privacy Policy | GEM Enterprise",
  description: "How GEM Enterprise handles personal information across public, request, and approved client workflows.",
};

const tocItems = [
  { id: "information", label: "1. Information We Handle" },
  { id: "use", label: "2. How We Use Information" },
  { id: "sharing", label: "3. Service Providers & Disclosure" },
  { id: "security", label: "4. Security" },
  { id: "retention", label: "5. Retention" },
  { id: "rights", label: "6. Your Choices & Rights" },
  { id: "cookies", label: "7. Cookies & Analytics" },
  { id: "transfers", label: "8. International Processing" },
  { id: "children", label: "9. Children's Privacy" },
  { id: "contact", label: "10. Contact" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 scroll-mt-8">
      <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">{title}</h2>
      <div className="space-y-4 text-[hsl(var(--foreground)/0.78)] leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-[hsl(var(--primary)/0.1)] p-2.5 text-[hsl(var(--primary))]">
              <Eye className="h-5 w-5" />
            </div>
            <Badge className="border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.1)] px-3 py-1 font-mono text-xs uppercase tracking-widest text-[hsl(var(--primary))]">
              Privacy notice
            </Badge>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-[hsl(var(--foreground))]">Privacy Policy</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Last updated: September 13, 2026</p>
          <p className="mt-5 max-w-3xl leading-7 text-[hsl(var(--foreground)/0.78)]">
            This notice describes how GEM Enterprise handles personal information through its public website,
            request forms, account and workspace features, and approved service workflows. The information and
            controls involved depend on the feature, service, jurisdiction, provider configuration, and approved
            scope that actually applies to you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          <aside className="shrink-0 lg:w-64">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] p-5 lg:sticky lg:top-8">
              <div className="mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-[hsl(var(--primary))]" /><span className="text-sm font-semibold">Contents</span></div>
              <nav className="space-y-1">{tocItems.map((item) => <a key={item.id} href={`#${item.id}`} className="block py-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">{item.label}</a>)}</nav>
              <Separator className="my-4" />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Privacy questions</p>
              <a href="mailto:privacy@gemcybersecurityassist.com" className="mt-1 block break-all text-xs text-[hsl(var(--primary))] hover:underline">privacy@gemcybersecurityassist.com</a>
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-10">
            <Section id="information" title="1. Information We Handle">
              <p><strong>Information you provide.</strong> We may handle contact details, organization and role information, request or intake answers, account/profile information, messages, documents, and other information you choose to submit through an available GEM workflow.</p>
              <p><strong>Account and technical information.</strong> When platform features are used, systems may generate authentication, session, device, browser, network, access, audit, security, and operational records needed to operate and protect the service.</p>
              <p><strong>Verification information.</strong> Some approved services or applicant types may require identity, eligibility, compliance, or other verification information. GEM does not represent that every user is subject to KYC/AML, biometric, accreditation, source-of-funds, or similar checks. Any such collection must be tied to the applicable workflow, jurisdiction, configured provider, and stated purpose.</p>
              <p><strong>Payment information.</strong> Where a paid engagement is approved, payment and reconciliation information may be processed through the payment method or provider used for that engagement. GEM should not be assumed to store full card or bank credentials unless a specific production workflow expressly states that it does.</p>
            </Section>
            <Separator />

            <Section id="use" title="2. How We Use Information">
              <p>We use information as reasonably necessary to receive and evaluate requests, operate accounts and approved workspaces, provide contracted or requested services, communicate about a request or relationship, maintain security and audit evidence, prevent misuse, improve platform operations, and comply with applicable legal obligations.</p>
              <p>Marketing communications are subject to the applicable communication preference, consent or other reviewed basis, suppression state, jurisdictional requirements, and unsubscribe controls. An active account or verified email address alone is not treated as marketing permission.</p>
            </Section>
            <Separator />

            <Section id="sharing" title="3. Service Providers & Disclosure">
              <p>We may disclose information to service providers that support hosting, communications, identity or verification, analytics, payment, security, storage, or other approved platform functions when those providers are actually configured for the relevant workflow. Access should be limited to the information reasonably needed for that function and governed by the applicable provider terms and controls.</p>
              <p>We may also disclose information when reasonably necessary to comply with law, respond to valid legal process, protect rights or safety, investigate misuse, or support a lawful business transaction. GEM does not claim a provider, regulator, accreditation, partnership, or data-processing relationship unless that relationship is actually in place and applicable.</p>
            </Section>
            <Separator />

            <Section id="security" title="4. Security">
              <p>GEM uses technical and organizational safeguards appropriate to the production systems and providers used for a given workflow. These may include access controls, authentication controls, encrypted transport or storage provided by applicable infrastructure, audit logging, secret-management practices, and security monitoring where configured and verified.</p>
              <p>Security controls differ by system and can change as infrastructure is updated. This policy does not make an absolute claim that every datum, endpoint, administrator, provider, or environment uses a particular protocol, cipher, PAM product, SOC/SIEM service, penetration-test cadence, or certification unless that control is separately verified and published as such.</p>
              <p>No transmission, storage, or security control can guarantee complete security. If a reportable incident affects personal information, GEM will handle notification obligations according to the facts, applicable law, and relevant service-provider responsibilities.</p>
            </Section>
            <Separator />

            <Section id="retention" title="5. Retention">
              <p>We retain information for the period reasonably needed for the purpose for which it was collected, to maintain security or audit evidence, resolve disputes, enforce agreements, or meet applicable legal obligations. Retention periods can differ by record type, workflow, jurisdiction, and service-provider configuration.</p>
              <p>GEM does not apply a universal five-, seven-, or ten-year retention period to every user or record merely because the platform can support financial, compliance, or verification-related workflows.</p>
            </Section>
            <Separator />

            <Section id="rights" title="6. Your Choices & Rights">
              <p>Depending on where you live and the law that applies, you may have rights concerning access, correction, deletion, portability, objection, restriction, or withdrawal of consent. Some requests may be limited by security, identity-verification, recordkeeping, contractual, or legal requirements.</p>
              <p>To make a privacy request, email <a href="mailto:privacy@gemcybersecurityassist.com" className="text-[hsl(var(--primary))] underline">privacy@gemcybersecurityassist.com</a>. GEM may need reasonable information to verify the requester and identify the records involved. Response timing follows applicable law rather than a universal public service-level guarantee.</p>
            </Section>
            <Separator />

            <Section id="cookies" title="7. Cookies & Analytics">
              <p>The platform may use cookies, local storage, session mechanisms, analytics, or similar technologies that are necessary for authentication, security, preferences, measurement, or other configured functions. The exact technologies in use can vary by route and deployment.</p>
              <p>Where optional analytics or marketing technologies are introduced, they should be used consistently with the applicable notice, consent requirements, provider configuration, and GEM governance controls.</p>
            </Section>
            <Separator />

            <Section id="transfers" title="8. International Processing">
              <p>Some service providers or infrastructure may process information in locations different from your own. Where cross-border processing is subject to specific legal requirements, the applicable safeguards depend on the provider, data flow, jurisdiction, and legal mechanism actually used for that workflow.</p>
            </Section>
            <Separator />

            <Section id="children" title="9. Children's Privacy">
              <p>GEM Enterprise is designed for business and adult-user workflows and is not intended for children. If you believe a child has submitted personal information through a GEM service, contact the privacy address below so the situation can be reviewed and handled appropriately.</p>
            </Section>
            <Separator />

            <Section id="contact" title="10. Contact">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.6)] p-5">
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-[hsl(var(--primary))]" /><strong>GEM Enterprise Privacy</strong></div>
                <a href="mailto:privacy@gemcybersecurityassist.com" className="mt-3 block text-sm text-[hsl(var(--primary))] underline">privacy@gemcybersecurityassist.com</a>
                <a href="mailto:compliance@gemcybersecurityassist.com" className="mt-2 block text-sm text-[hsl(var(--primary))] underline">compliance@gemcybersecurityassist.com</a>
              </div>
            </Section>

            <section className="rounded-xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)] p-5">
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--primary))]" /><div><h2 className="font-semibold">Controlled notice</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground)/0.72)]">This notice should be updated when material data flows, providers, collection practices, or legal requirements change. Service-specific terms, notices, agreements, and approved scopes may provide additional detail for a particular engagement.</p></div></div>
            </section>

            <div className="flex gap-4 text-sm"><Link href="/terms" className="text-[hsl(var(--primary))] hover:underline">Terms of Service</Link><Link href="/trust-center" className="text-[hsl(var(--primary))] hover:underline">Trust Center</Link></div>
          </main>
        </div>
      </div>
    </div>
  );
}
