import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, LockKeyhole } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { TokMetricAgentsConsole } from "@/components/tokmetric/TokMetricAgentsConsole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TokMetric Specialized Agents",
  description: "Run controlled, schema-bound TokMetric content and review agents inside an authorized workspace.",
  alternates: { canonical: "/tokmetric/agents" },
};

export default async function TokMetricAgentsPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-[#091019] text-white">
        <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <Link href="/tokmetric" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-300">
            <ArrowLeft className="h-4 w-4" />
            Back to TokMetric
          </Link>
          <section className="mt-8 rounded-3xl border border-white/[0.1] bg-white/[0.03] p-8 sm:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10">
              <LockKeyhole className="h-6 w-6 text-amber-200" />
            </div>
            <h1 className="mt-6 text-4xl font-bold">Authentication required</h1>
            <p className="mt-4 max-w-2xl leading-8 text-white/55">Specialized agents use workspace records and create protected audit events. Sign in to an authorized GEM Enterprise account before opening this console.</p>
            <Link href="/client-login?next=%2Ftokmetric%2Fagents" className="mt-7 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#071019] hover:bg-cyan-200">Sign in</Link>
          </section>
        </main>
      </div>
    );
  }

  const internalRole = ["admin", "super_admin", "internal"].includes(session.role);
  const workspaces = internalRole
    ? await db.workspace.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { updatedAt: "desc" },
        take: 50,
      })
    : (
        await db.workspaceMember.findMany({
          where: { userId: session.userId, status: "active" },
          select: { workspace: { select: { id: true, name: true, slug: true } } },
          orderBy: { updatedAt: "desc" },
          take: 50,
        })
      ).map((membership) => membership.workspace);

  return (
    <div className="min-h-screen bg-[#091019] text-white">
      <header className="border-b border-white/[0.08] bg-[#0b121d]">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/tokmetric/dashboard" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-cyan-300">
            <ArrowLeft className="h-4 w-4" />
            TokMetric dashboard
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Controlled agent operations</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Specialized Agents</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">Create structured campaign, script, review, and publishing-preparation outputs with workspace retrieval, safety evaluation, version tracking, and immutable operational evidence.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-sm text-cyan-100/70">
              <Bot className="h-4 w-4" />
              External actions disabled
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <TokMetricAgentsConsole workspaces={workspaces} />
      </main>
    </div>
  );
}
