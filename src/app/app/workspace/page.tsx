import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  Plug,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isPlatformOwnerRole, requireSession } from "@/lib/api/auth-helpers";
import { resolveWorkspaceAccess } from "@/lib/workspaceAccess";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Workspace | GEM Enterprise",
  description: "Membership-scoped GEM Enterprise organization workspace.",
};

export const dynamic = "force-dynamic";

interface WorkspacePageProps {
  searchParams: Promise<{
    workspace?: string | string[];
    access?: string | string[];
  }>;
}

function firstString(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function ControlState({ locked }: { locked: boolean }) {
  return (
    <Badge
      className={cn(
        "border",
        locked
          ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
          : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      )}
    >
      {locked ? (
        <LockKeyhole className="mr-1.5 h-3.5 w-3.5" />
      ) : (
        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
      )}
      {locked ? "Locked" : "Available"}
    </Badge>
  );
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const gate = await requireSession();
  if (!gate.ok) {
    redirect("/client-login?next=/app/workspace");
  }
  if (gate.accountStatus !== "active") {
    redirect("/client-login?status=account-review");
  }

  const params = await searchParams;
  const requestedWorkspaceId = firstString(params.workspace);
  const accessNotice = firstString(params.access);
  const resolution = await resolveWorkspaceAccess(
    gate.session.userId,
    requestedWorkspaceId,
  );

  if (resolution.requestedDenied) {
    redirect("/app/workspace?access=denied");
  }

  const selected = resolution.selected;

  if (!selected) {
    const owner = isPlatformOwnerRole(gate.session.role);
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-8">
        <Card className="border-amber-400/20 bg-amber-400/[0.04]">
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10">
              <Building2 className="h-5 w-5 text-amber-300" />
            </div>
            <CardTitle className="text-xl text-white">No active workspace assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-7 text-slate-300">
              Your account is authenticated, but it is not currently assigned to an active
              organization workspace. GEM does not create a synthetic client membership or expose
              another organization as a fallback.
            </p>
            <div className="rounded-xl border border-white/10 bg-black/15 p-4 text-sm leading-6 text-slate-400">
              Workspace access begins only after an administrator assigns your account to a real
              organization workspace with an active membership and role.
            </div>
            <div className="flex flex-wrap gap-3">
              {owner && (
                <Button asChild className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                  <Link href="/app/admin/plan-workspaces">
                    Open owner plan preview <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="border-white/15 text-slate-200">
                <Link href="/app/support">Contact workspace support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const controls = [
    ["Global emergency lock", selected.controls.globalEmergencyLock],
    ["Publishing", selected.controls.publishingDisabled],
    ["Advertising", selected.controls.advertisingDisabled],
    ["Shop write operations", selected.controls.shopWriteDisabled],
    ["Connector operations", selected.controls.connectorDisabled],
  ] as const;

  return (
    <div className="space-y-6 pb-10">
      {accessNotice === "denied" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          The requested workspace was not assigned to your account. Your first active membership is
          shown instead.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_38%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Membership scoped
              </Badge>
              <Badge variant="outline" className="border-white/15 text-slate-300">
                Real organization workspace
              </Badge>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {selected.organization.name}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {selected.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              This page is resolved from your active workspace membership. It does not use the
              synthetic Basic, Professional, or Enterprise preview records.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 xl:min-w-[280px]">
            <p className="text-xs uppercase tracking-wider text-slate-500">Assigned role</p>
            <p className="mt-2 font-semibold text-white">{selected.role.name}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {selected.role.description ?? "No additional role description is recorded."}
            </p>
          </div>
        </div>
      </section>

      {resolution.workspaces.length > 1 && (
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-sm text-white">Your assigned workspaces</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {resolution.workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/app/workspace?workspace=${encodeURIComponent(workspace.id)}`}
                className={cn(
                  "rounded-xl border p-4 transition",
                  workspace.id === selected.id
                    ? "border-cyan-400/35 bg-cyan-400/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20",
                )}
              >
                <p className="text-xs text-slate-500">{workspace.organization.name}</p>
                <p className="mt-1 font-semibold text-white">{workspace.name}</p>
                <p className="mt-2 text-xs text-slate-400">{workspace.role.name}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Active members", selected.counts.members, Users],
          ["Connector records", selected.counts.connectors, Plug],
          ["Approval records", selected.counts.approvalRecords, ClipboardList],
        ].map(([label, value, Icon]) => (
          <Card key={String(label)} className="border-white/10 bg-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Workspace controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {controls.map(([label, locked]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-3"
              >
                <span className="text-sm text-slate-300">{label}</span>
                <ControlState locked={locked} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-base text-white">Role permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {selected.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selected.permissions.map((permission) => (
                  <Badge
                    key={`${permission.scope}:${permission.action}`}
                    variant="outline"
                    className="border-white/12 bg-white/[0.025] text-slate-300"
                  >
                    {permission.scope} · {permission.action}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm leading-6 text-slate-400">
                No explicit permission labels are attached to this membership role. Protected
                actions remain unavailable unless an authoritative server-side gate permits them.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-cyan-400/15 bg-cyan-400/[0.035]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">Data boundary</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Workspace selection is validated on the server from your active memberships. Platform
              owner status alone does not expose another client's workspace through this route.
            </p>
          </div>
          {isPlatformOwnerRole(gate.session.role) && (
            <Button asChild variant="outline" className="shrink-0 border-cyan-400/25 text-cyan-200">
              <Link href="/app/admin/plan-workspaces">Open synthetic plan preview</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
