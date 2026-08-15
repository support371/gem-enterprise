"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle,
  ClipboardList,
  Mail,
  PieChart,
  Rss,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminPortalNavGroups,
  type PlatformNavIcon,
} from "@/lib/platformNavigation";

interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  openApprovals: number;
  openTickets: number;
}

const iconMap: Partial<Record<PlatformNavIcon, ComponentType<{ className?: string }>>> = {
  Activity,
  Building2,
  CheckCircle,
  ClipboardList,
  Mail,
  PieChart,
  Rss,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
};

const groupDescriptions: Record<string, string> = {
  "Organizations & access":
    "Manage tenant workspaces, weekly reporting, memberships, and plan-level operating views.",
  "Identity & decisions":
    "Move applicants and members through intake, verification, approval, and entitlement review.",
  "Operations & evidence":
    "Inspect platform APIs, audit evidence, communications, and automated intelligence operations.",
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [viewerRole, setViewerRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch("/api/admin/stats", { cache: "no-store" }).then((response) =>
        response.ok ? response.json() : null,
      ),
      fetch("/api/auth/session", { cache: "no-store" }).then((response) =>
        response.ok ? response.json() : null,
      ),
    ])
      .then(([statsResult, sessionResult]) => {
        if (!active) return;
        setStats(statsResult);
        setViewerRole(sessionResult?.role ?? null);
      })
      .catch(() => {
        if (active) setStats(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const platformStats = [
    {
      label: "Users",
      value: stats?.totalUsers,
      helper: "active accounts",
      href: "/app/admin/users",
      icon: Users,
      tone: "text-cyan-300 bg-cyan-400/10",
    },
    {
      label: "KYC review",
      value: stats?.pendingKyc,
      helper: "awaiting review",
      href: "/app/admin/kyc",
      icon: CheckCircle,
      tone: "text-amber-300 bg-amber-400/10",
    },
    {
      label: "Approvals",
      value: stats?.openApprovals,
      helper: "manual decisions",
      href: "/app/admin/approvals",
      icon: ClipboardList,
      tone: "text-rose-300 bg-rose-400/10",
    },
    {
      label: "Support",
      value: stats?.openTickets,
      helper: "open tickets",
      href: "/app/support",
      icon: ShieldCheck,
      tone: "text-emerald-300 bg-emerald-400/10",
    },
  ];

  const visibleGroups = useMemo(
    () =>
      adminPortalNavGroups.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => !item.ownerOnly || viewerRole === "super_admin",
        ),
      })),
    [viewerRole],
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="overflow-hidden rounded-3xl border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_42%),rgba(255,255,255,0.035)] p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              Enterprise administration
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
              <Shield className="h-8 w-8 text-cyan-300" aria-hidden="true" />
              Admin Center
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Choose the workspace you need, complete the task on its dedicated page, and return here for the next administrative workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-cyan-300">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Protected admin surface
            </Badge>
            <Button asChild variant="outline" className="border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]">
              <Link href="/app/command-center">Open enterprise analytics</Link>
            </Button>
          </div>
        </div>
      </header>

      <section aria-labelledby="admin-priority-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Current workload</p>
            <h2 id="admin-priority-title" className="mt-1 text-xl font-bold text-white">Priority queues</h2>
          </div>
          <Link href="/app/admin/audit" className="hidden items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 sm:flex">
            Review audit evidence <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {platformStats.map(({ label, value, helper, href, icon: Icon, tone }) => {
            const [textClass, backgroundClass] = tone.split(" ");
            return (
              <Link
                key={label}
                href={href}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.055] sm:p-5"
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${backgroundClass}`}>
                  <Icon className={`h-5 w-5 ${textClass}`} aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-white sm:text-3xl">{value ?? "—"}</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{helper}</p>
                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-300 opacity-80 transition group-hover:opacity-100">
                  Open page <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {viewerRole === "super_admin" && (
        <section aria-labelledby="governance-loop-title" className="rounded-3xl border border-amber-400/20 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,.1),transparent_42%),rgba(255,255,255,.025)] p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-300">Super-admin governance loop</p>
              <h2 id="governance-loop-title" className="mt-2 text-2xl font-bold text-white">Assign access, oversee delivery, receive approved reporting</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">This is the central governance surface for organizations, workspaces, projects, roles, and reporting. Membership remains the authority: oversight does not silently impersonate a client or expose another organization.</p>
            </div>
            <Badge className="w-fit border-amber-400/25 bg-amber-400/10 text-amber-200">Super admin only</Badge>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              {label:"Workspace access",detail:"Assign users and controlled workspace roles.",href:"/app/admin/workspace-access"},
              {label:"Organization highlights",detail:"Receive approved weekly project reporting.",href:"/app/admin/organization-reports"},
              {label:"Users",detail:"Manage official platform account state.",href:"/app/admin/users"},
              {label:"Audit evidence",detail:"Review traceable administrative activity.",href:"/app/admin/audit"},
            ].map((item)=><Link key={item.href} href={item.href} className="group rounded-xl border border-white/10 bg-black/15 p-4 transition hover:border-amber-400/25"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-white">{item.label}</p><ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-300"/></div><p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p></Link>)}
          </div>
        </section>
      )}

      <section aria-labelledby="admin-directory-title">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Page directory</p>
        <h2 id="admin-directory-title" className="mt-1 text-xl font-bold text-white">Administrative workspaces</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Every area below opens independently, keeps its own task context, and links back to related workflows.
        </p>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {visibleGroups.map((group) => (
            <article key={group.label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
              <h3 className="text-base font-bold text-white">{group.label}</h3>
              <p className="mt-2 min-h-12 text-xs leading-6 text-slate-500">{groupDescriptions[group.label]}</p>
              <div className="mt-4 space-y-2">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon] ?? Shield;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-3.5 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.045]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-100">{item.label}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
