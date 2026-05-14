import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileText,
  Lock,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const vaultRoutes = [
  {
    title: "Portfolio Review",
    description: "Review vault-related allocation, access, and account structure with the operations team.",
    href: "/app/requests?type=portfolio_review",
    icon: Briefcase,
  },
  {
    title: "Document Readiness",
    description: "Open vault-related statements, agreements, identity files, and compliance records.",
    href: "/app/documents",
    icon: FileText,
  },
  {
    title: "Compliance Check",
    description: "Review KYC state, disclosure status, and entitlement readiness before vault access changes.",
    href: "/app/compliance",
    icon: ShieldCheck,
  },
  {
    title: "Service Request",
    description: "Submit a structured request for account review, transfer support, or advisor follow-up.",
    href: "/app/requests?type=document_request",
    icon: ClipboardList,
  },
];

const controls = [
  "No hardcoded balances are shown in this client surface.",
  "Vault actions are routed through existing request and document workflows.",
  "Access changes remain dependent on compliance and entitlement state.",
  "Future live balances should come from a verified account ledger API.",
];

export default function SavingsVaultPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <PiggyBank className="h-3.5 w-3.5" /> Vault Operations
          </div>
          <h1 className="text-2xl font-bold text-white">Savings Vault</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Coordinate vault-related reviews, documents, compliance checks, and service requests through controlled GEM Enterprise workflows.
          </p>
        </div>
        <Badge className="border-green-500/25 bg-green-500/15 text-green-400">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Workflow Controlled
        </Badge>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
              <Lock className="h-6 w-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Vault access is operationally gated.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Savings and vault workflows should not display unverified balances or simulated transactions. This surface routes clients to the live operational systems already present in the application.
            </p>
          </div>
          <div className="grid gap-3">
            {controls.map((control) => (
              <div key={control} className="rounded-2xl border border-white/10 bg-background/60 p-4 text-sm text-slate-300">
                {control}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {vaultRoutes.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href} className="glass-panel bento-card rounded-2xl p-6 transition hover:border-cyan-500/30">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
              <Icon className="h-6 w-6 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-400">
              Open workflow <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </section>

      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
        <p className="text-sm font-semibold text-yellow-400">Ledger integration pending</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Real balances, transfers, interest activity, escrow states, and coverage indicators should be displayed only after a verified vault ledger API is connected.
        </p>
        <Button asChild variant="outline" className="mt-4 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
          <Link href="/app/requests?type=portfolio_review">Request Vault Review</Link>
        </Button>
      </div>
    </div>
  );
}
