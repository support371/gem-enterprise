import type { Metadata } from "next";
import Link from "next/link";
import {
  UserCircle2,
  Building2,
  MapPin,
  ShieldCheck,
  Bookmark,
  Eye,
  Settings as SettingsIcon,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/hub/VerificationBadge";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your GEM Community Hub profile — expertise, company, network preferences, and privacy controls.",
};

const EXPERTISE = [
  "Cross-border structuring",
  "Private credit",
  "Logistics",
  "Regulatory strategy",
  "Infrastructure",
];

const SAVED = [
  { label: "OP-2601 — GCC logistics corridor", tag: "Opportunity" },
  { label: "Cross-Border Capital Circle", tag: "Circle" },
  { label: "Cross-Border Capital Briefing — Q2 2026", tag: "Event" },
  { label: "Enterprise Risk Framework v4.1", tag: "Resource" },
];

const VISIBILITY = [
  {
    label: "Discoverability",
    detail: "Visible to verified members within matched sectors",
    status: "Scoped",
  },
  {
    label: "Intro requests",
    detail: "Require GEM concierge review before forwarding",
    status: "On",
  },
  {
    label: "Activity feed",
    detail: "Network activity shown to your Strategic Circles",
    status: "Circles only",
  },
  {
    label: "Audit trail",
    detail: "All profile edits logged to compliance record",
    status: "Always",
  },
];

export default function ProfilePage() {
  return (
    <>
      {/* Profile header */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-5">
              <div
                aria-hidden="true"
                className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 font-mono text-2xl font-semibold text-primary"
              >
                MH
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <VerificationBadge status="Verified" size="md" />
                  <Badge className="rounded-full border border-white/10 bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-white/60">
                    Partner
                  </Badge>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  M. Harrington
                </h1>
                <p className="mt-1 text-sm text-white/65">
                  Chief Investment Officer
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Meridian Capital
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    London, UK · Cross-border
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                    Verified 14 Jan 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 border border-white/10 bg-transparent text-white/75 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                <Link href="/community-hub/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  Settings
                </Link>
              </Button>
              <Button
                size="sm"
                className="h-9 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Company card */}
            <article className="rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6">
              <div className="mb-2 flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
                  Company
                </h2>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-foreground">
                    Meridian Capital
                  </p>
                  <p className="mt-0.5 text-xs font-mono uppercase tracking-wider text-primary/75">
                    Private Credit · London
                  </p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Institutional private credit manager focused on senior-secured
                    deployments across Europe, MENA, and select emerging markets.
                    Anchor partner in several GEM mandates.
                  </p>
                </div>
                <Badge className="shrink-0 rounded-full border border-primary/25 bg-primary/8 font-mono text-[10px] uppercase tracking-wider text-primary/90">
                  <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                  Partner firm
                </Badge>
              </div>
            </article>

            {/* Expertise */}
            <article className="rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
                Expertise
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {EXPERTISE.map((e) => (
                  <span
                    key={e}
                    className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-white/75"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </article>

            {/* Network preferences */}
            <article className="rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
                Network preferences
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Jurisdictions",
                    value: "UK, EU, GCC, Nigeria, Kenya",
                  },
                  {
                    label: "Ticket size",
                    value: "USD 25–150M",
                  },
                  {
                    label: "Mandate types",
                    value: "Capital, Secondaries, Partnerships",
                  },
                  {
                    label: "Preferred sectors",
                    value: "Logistics, Infrastructure, Private Credit",
                  },
                ].map((pref) => (
                  <div key={pref.label}>
                    <dt className="text-xs text-white/40">{pref.label}</dt>
                    <dd className="mt-0.5 text-sm text-foreground">
                      {pref.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Saved items */}
            <article className="rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
                  Saved
                </h2>
                <Bookmark className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <ul className="divide-y divide-white/[0.05]" role="list">
                {SAVED.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="truncate text-white/80">{s.label}</span>
                    <Badge className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-white/60">
                      {s.tag}
                    </Badge>
                  </li>
                ))}
              </ul>
            </article>

            {/* Visibility */}
            <article className="rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">
                  Visibility settings
                </h2>
                <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <ul className="space-y-4" role="list">
                {VISIBILITY.map((v) => (
                  <li key={v.label} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {v.label}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">{v.detail}</p>
                    </div>
                    <Badge className="shrink-0 rounded-full border border-primary/25 bg-primary/8 font-mono text-[10px] uppercase tracking-wider text-primary/90">
                      {v.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
