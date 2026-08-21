"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Building2, KeyRound, ShieldCheck, Users, UserRoundCog } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LoginPortalKind = "identity" | "client" | "team" | "admin" | "super_admin";

const portalConfig = {
  identity: { eyebrow: "Secure identity", title: "Sign in to GEM", description: "GEM verifies your account, then opens only the organization and operating surface assigned to you.", Icon: KeyRound, iconClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300", accent: "text-cyan-300", button: "bg-cyan-300 hover:bg-cyan-200" },
  client: { eyebrow: "Client access", title: "Client & organization portal", description: "Open the organization, projects, services, documents, and reporting assigned to your account.", Icon: Building2, iconClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300", accent: "text-cyan-300", button: "bg-cyan-300 hover:bg-cyan-200" },
  team: { eyebrow: "Team operations", title: "Assigned team workspace", description: "Open assigned projects, tasks, tools, meetings, and weekly reporting without client or owner controls.", Icon: Users, iconClass: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", accent: "text-emerald-300", button: "bg-emerald-300 hover:bg-emerald-200" },
  admin: { eyebrow: "Scoped administration", title: "Administrator console", description: "Manage approved accounts, reviews, operations, and evidence within your delegated administrative scope.", Icon: UserRoundCog, iconClass: "border-amber-400/20 bg-amber-400/10 text-amber-300", accent: "text-amber-300", button: "bg-amber-300 hover:bg-amber-200" },
  super_admin: { eyebrow: "Restricted owner access", title: "Owner control plane", description: "Govern organizations, administrators, access policy, system operations, and audit evidence from the isolated owner surface.", Icon: ShieldCheck, iconClass: "border-violet-400/20 bg-violet-400/10 text-violet-300", accent: "text-violet-300", button: "bg-violet-300 hover:bg-violet-200" },
} as const;

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type LoginResponse = { success?: boolean; role?: string; redirect?: string; error?: string };

function safeRedirectTarget(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function canUseRequestedDestination(role: string | undefined, destination: string) {
  if (destination.startsWith("/app/admin") || destination.startsWith("/app/command-center")) {
    return role === "admin" || role === "super_admin" || role === "internal";
  }
  if (destination.startsWith("/review")) {
    return role === "analyst" || role === "admin" || role === "super_admin" || role === "internal";
  }
  return true;
}

function canUsePortal(role: string | undefined, portal: LoginPortalKind) {
  if (portal === "identity") return true;
  if (portal === "client") return role === "client";
  if (portal === "team") return role === "analyst";
  if (portal === "admin") return role === "admin" || role === "internal";
  return role === "super_admin";
}

export function RoleLoginPortal({ portal }: { portal: LoginPortalKind }) {
  const config = portalConfig[portal];
  const Icon = config.Icon;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const signedOut = searchParams.get("signedOut") === "1";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.email, password: data.password }) });
      const body = (await response.json().catch(() => ({}))) as LoginResponse;
      if (!response.ok) {
        setServerError(body.error || "Invalid credentials. Check your email and password.");
        return;
      }
      if (!canUsePortal(body.role, portal)) {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
        setServerError("This account belongs to a different protected workspace. Use the official access link assigned to your account.");
        return;
      }
      const requested = safeRedirectTarget(searchParams.get("next"));
      const authoritative = safeRedirectTarget(body.redirect) ?? "/access/continue";
      router.replace(requested && canUseRequestedDestination(body.role, requested) ? requested : authoritative);
      router.refresh();
    } catch {
      setServerError("The sign-in service could not be reached. Please try again.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background cyber-grid">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,.08),transparent_34%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <section className="hidden rounded-3xl border border-white/10 bg-white/[0.035] p-8 lg:block">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.18em] text-cyan-300"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> GEM Enterprise</span>
          <h2 className="mt-8 max-w-xl text-4xl font-bold leading-tight text-white">One platform. Separate authority. Clear workspaces.</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-400">Your credentials determine your real role on the server. This page only opens the correct doorway; it cannot grant permissions, memberships, or administrative authority.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">{["Role-specific navigation", "Membership-scoped projects", "Dedicated tool environments", "Audited owner controls"].map((item) => <div key={item} className="rounded-xl border border-white/10 bg-black/15 p-4 text-sm font-medium text-slate-200">{item}</div>)}</div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Return to GEM Enterprise</Link>
          <div className="glass-panel rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-8">
            <div className="mb-7">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${config.iconClass}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <p className={`mt-5 text-xs font-semibold uppercase tracking-[.18em] ${config.accent}`}>{config.eyebrow}</p>
              <h1 className="mt-2 text-2xl font-bold text-white">{config.title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">{config.description}</p>
            </div>
            {signedOut ? <Alert className="mb-5 border-emerald-400/20 bg-emerald-400/10 text-emerald-100"><AlertDescription>You have been signed out securely.</AlertDescription></Alert> : null}
            {serverError ? <Alert variant="destructive" className="mb-5"><AlertDescription>{serverError}</AlertDescription></Alert> : null}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-2"><Label htmlFor={`${portal}-email`}>Email address</Label><Input id={`${portal}-email`} type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} aria-invalid={Boolean(errors.email)} className="min-h-11 border-white/10 bg-white/5" />{errors.email ? <p className="text-xs text-red-300">{errors.email.message}</p> : null}</div>
              <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor={`${portal}-password`}>Password</Label><Link href="/forgot-password" className="text-xs text-cyan-300 hover:underline">Forgot password?</Link></div><Input id={`${portal}-password`} type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} aria-invalid={Boolean(errors.password)} className="min-h-11 border-white/10 bg-white/5" />{errors.password ? <p className="text-xs text-red-300">{errors.password.message}</p> : null}</div>
              <Button type="submit" disabled={isSubmitting} className={`min-h-11 w-full font-semibold text-slate-950 ${config.button}`}>{isSubmitting ? "Verifying access…" : portal === "identity" ? "Verify account and continue" : `Continue to ${config.title}`}</Button>
            </form>
            <p className="mt-5 text-center text-xs leading-5 text-slate-500">No role is selected here. Official access comes only from the authenticated account and active workspace membership.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
