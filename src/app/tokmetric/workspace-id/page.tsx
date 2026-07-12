import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Copy, LockKeyhole } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TokMetric Workspace IDs",
  description: "View authorized TokMetric workspace identifiers for production verification and Custom GPT configuration.",
  alternates: { canonical: "/tokmetric/workspace-id" },
};

export default async function TokMetricWorkspaceIdPage() {
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
            <p className="mt-4 max-w-2xl leading-8 text-white/55">
              Sign in to an authorized GEM Enterprise account to view TokMetric workspace identifiers.
            </p>
            <Link href="/client-login?next=%2Ftokmetric%2Fworkspace-id" className="mt-7 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-[#071019] hover:bg-cyan-200">
              Sign in
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const internalRole = ["admin", "super_admin", "internal"].includes(session.role);
  const workspaces = internalRole
    ? await db.workspace.findMany({
        select: { id: true, name: true, slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 50,
      })
    : (
        await db.workspaceMember.findMany({
          where: { userId: session.userId, status: "active" },
          select: { workspace: { select: { id: true, name: true, slug: true, updatedAt: true } } },
          orderBy: { updatedAt: "desc" },
          take: 50,
        })
      ).map((membership) => membership.workspace);

  return (
    <div className="min-h-screen bg-[#091019] text-white">
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/tokmetric/agents" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-300">
          <ArrowLeft className="h-4 w-4" />
          Back to Specialized Agents
        </Link>

        <section className="mt-8 rounded-3xl border border-white/[0.1] bg-white/[0.03] p-8 sm:p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
              <Copy className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Authorized workspace lookup</p>
              <h1 className="mt-2 text-4xl font-bold">TokMetric Workspace IDs</h1>
            </div>
          </div>

          <p className="mt-5 max-w-3xl leading-8 text-white/55">
            Use the exact database ID below when running the read-only Custom GPT smoke test. A workspace slug or display name is not accepted in place of the ID.
          </p>

          <div className="mt-8 space-y-4">
            {workspaces.length ? (
              workspaces.map((workspace) => (
                <article key={workspace.id} className="rounded-2xl border border-white/[0.08] bg-[#071019] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{workspace.name}</h2>
                      <p className="mt-1 text-sm text-white/40">Slug: {workspace.slug}</p>
                    </div>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-1 text-xs font-semibold text-emerald-200">AUTHORIZED</span>
                  </div>
                  <div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Workspace ID</p>
                    <code className="mt-2 block select-all break-all text-sm text-cyan-100">{workspace.id}</code>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-6 text-amber-100/80">
                No authorized TokMetric workspace is available for this account.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
