import Link from "next/link";
import {
  Activity,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const areas = [
  {
    title: "Client access & tenancy",
    description: "Workspace assignment, memberships, roles, permissions, and organization isolation.",
    href: "/app/admin/workspace-access",
    icon: Building2,
  },
  {
    title: "Customer lifecycle",
    description: "Lead, intake, qualification, conversion, success, renewal, and relationship management.",
    href: "/app/admin/customer-success",
    icon: Users,
  },
  {
    title: "Threat & security operations",
    description: "Monitoring, security signals, evidence, incidents, and governed escalation.",
    href: "/app/command-center/monitoring",
    icon: ShieldAlert,
  },
  {
    title: "Compliance & verification",
    description: "KYC, compliance review, evidence, approvals, and regulatory decisioning.",
    href: "/app/admin/kyc",
    icon: ShieldCheck,
  },
  {
    title: "Legal & policy",
    description: "Legal-service requests, policy controls, evidence handling, and approval records.",
    href: "/app/admin/approvals",
    icon: Scale,
  },
  {
    title: "Finance & portfolio",
    description: "Client entitlements, portfolio administration, financial service controls, and allocation operations.",
    href: "/app/admin/allocations",
    icon: Wallet,
  },
  {
    title: "Commercial & service operations",
    description: "Market pipeline, service activation, product delivery, and account expansion workflows.",
    href: "/app/admin/market/operations",
    icon: BadgeDollarSign,
  },
  {
    title: "Communication governance",
    description: "Business email permissions, campaign controls, customer communications, and delivery evidence.",
    href: "/app/admin/communications",
    icon: Mail,
  },
  {
    title: "Requests & approvals",
    description: "Manual actions, customer requests, approvals, exceptions, and controlled decisions.",
    href: "/app/admin/approvals",
    icon: ClipboardList,
  },
  {
    title: "Documents & evidence",
    description: "Client documents, statements, agreements, verification evidence, and retained records.",
    href: "/app/documents",
    icon: FileText,
  },
  {
    title: "Audit & accountability",
    description: "Administrative activity, access decisions, sensitive operations, and compliance evidence.",
    href: "/app/admin/audit",
    icon: Activity,
  },
  {
    title: "Platform integrations",
    description: "Provider connection state, scopes, owners, health, and remediation.",
    href: "/app/command-center/integrations",
    icon: CheckCircle2,
  },
];

export default function ClientOperationsPage() {
  return (
    <div className="space-y-7 pb-10">
      <header className="rounded-3xl border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.12),transparent_42%),rgba(255,255,255,.03)] p-6 sm:p-8">
        <Badge className="border-cyan-400/25 bg-cyan-400/10 text-cyan-200">Unified client operations</Badge>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Client Operations & Security Control Center</h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
          One administrative entry point for the complete client lifecycle: identity, access, finance,
          digital services, cybersecurity, compliance, legal workflow, communications, projects,
          evidence, approvals, and connected-service health. Existing GEM systems remain authoritative;
          this page consolidates their operating routes instead of duplicating them.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {areas.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href} className="group">
            <Card className="h-full border-white/10 bg-card transition hover:-translate-y-0.5 hover:border-cyan-400/30">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                </div>
                <CardTitle className="pt-2 text-base text-white">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-400">{description}</p>
                <p className="mt-4 text-xs font-semibold text-cyan-300">Open operating surface →</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <Card className="border-amber-400/15 bg-amber-400/[.03]">
        <CardContent className="p-5 text-sm leading-7 text-slate-300">
          Client data remains membership-scoped and permission-gated. Financial, digital-asset,
          cybersecurity, legal, and compliance actions must use the relevant authoritative service,
          approval, and audit controls; this control center does not bypass those boundaries.
        </CardContent>
      </Card>
    </div>
  );
}
