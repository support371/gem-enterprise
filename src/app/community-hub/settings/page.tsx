import type { Metadata } from "next";
import Link from "next/link";
import {
  Settings,
  BellRing,
  Lock,
  ShieldCheck,
  UserCircle2,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Hub Settings",
  description:
    "Manage your GEM Community Hub account — notifications, privacy, and membership status.",
};

const NOTIFICATIONS = [
  {
    id: "opportunities",
    title: "Matched opportunities",
    description: "Notify me when an opportunity matches my saved criteria.",
    defaultChecked: true,
  },
  {
    id: "intros",
    title: "Introduction updates",
    description: "Status changes on intro requests I've submitted.",
    defaultChecked: true,
  },
  {
    id: "circles",
    title: "Strategic Circle activity",
    description: "Updates and sessions from the Circles I belong to.",
    defaultChecked: true,
  },
  {
    id: "knowledge",
    title: "New knowledge releases",
    description: "Weekly digest of new briefs, playbooks, and market reports.",
    defaultChecked: false,
  },
  {
    id: "events",
    title: "Event registrations",
    description: "Confirmations and reminders for events I've registered for.",
    defaultChecked: true,
  },
];

const PRIVACY = [
  {
    id: "discoverable",
    title: "Discoverable in the directory",
    description: "Allow verified members in matched sectors to find you.",
    defaultChecked: true,
  },
  {
    id: "gem-review",
    title: "GEM concierge review",
    description: "Require GEM to vet incoming introduction requests first.",
    defaultChecked: true,
  },
  {
    id: "activity",
    title: "Share activity with Circles",
    description: "Let your Strategic Circles see your network activity.",
    defaultChecked: true,
  },
];

export default function HubSettingsPage() {
  return (
    <>
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <Settings className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Hub Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Manage your Community Hub preferences. Account-wide settings — billing,
            security, and data controls — are in your{" "}
            <Link href="/app/settings" className="text-primary hover:underline">
              account settings
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            {/* Account card */}
            <SettingsCard
              icon={UserCircle2}
              title="Account"
              description="Identity attached to your verified membership."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display name" defaultValue="M. Harrington" />
                <Field label="Title" defaultValue="Chief Investment Officer" />
                <Field label="Company" defaultValue="Meridian Capital" readOnly />
                <Field label="Primary location" defaultValue="London, UK" />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">
                <span className="text-xs text-white/45">
                  Identity verified by GEM on 14 Jan 2026.
                </span>
                <Button
                  size="sm"
                  className="h-8 bg-primary/15 text-primary hover:bg-primary/20"
                >
                  Save changes
                </Button>
              </div>
            </SettingsCard>

            {/* Notifications */}
            <SettingsCard
              icon={BellRing}
              title="Notifications"
              description="Choose what surfaces into your inbox and feed."
            >
              <ul className="divide-y divide-white/[0.05]" role="list">
                {NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start justify-between gap-4 py-4"
                  >
                    <div className="max-w-xl">
                      <Label
                        htmlFor={`n-${n.id}`}
                        className="text-sm font-medium text-foreground"
                      >
                        {n.title}
                      </Label>
                      <p className="mt-0.5 text-xs text-white/50">
                        {n.description}
                      </p>
                    </div>
                    <Switch id={`n-${n.id}`} defaultChecked={n.defaultChecked} />
                  </li>
                ))}
              </ul>
            </SettingsCard>

            {/* Privacy */}
            <SettingsCard
              icon={Lock}
              title="Privacy controls"
              description="Define how discoverable you are to the verified network."
            >
              <ul className="divide-y divide-white/[0.05]" role="list">
                {PRIVACY.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-4 py-4"
                  >
                    <div className="max-w-xl">
                      <Label
                        htmlFor={`p-${p.id}`}
                        className="text-sm font-medium text-foreground"
                      >
                        {p.title}
                      </Label>
                      <p className="mt-0.5 text-xs text-white/50">
                        {p.description}
                      </p>
                    </div>
                    <Switch id={`p-${p.id}`} defaultChecked={p.defaultChecked} />
                  </li>
                ))}
              </ul>
            </SettingsCard>
          </div>

          {/* Right rail: membership status */}
          <aside className="flex flex-col gap-6">
            <SettingsCard
              icon={ShieldCheck}
              title="Membership status"
              description="Your standing in the GEM network."
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full border border-primary/25 bg-primary/8 font-mono text-[10px] uppercase tracking-wider text-primary/90">
                    Active · Partner tier
                  </Badge>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-white/40">Tier</dt>
                    <dd className="mt-0.5 text-foreground">Partner</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Member since</dt>
                    <dd className="mt-0.5 text-foreground">Mar 2024</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Next review</dt>
                    <dd className="mt-0.5 text-foreground">Mar 2027</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Circles</dt>
                    <dd className="mt-0.5 text-foreground">2 active</dd>
                  </div>
                </dl>
                <div className="mt-2 space-y-2 border-t border-white/[0.05] pt-3 text-xs text-white/50">
                  <p className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                    KYC complete
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                    Entitlements confirmed
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
                    Compliance screening current
                  </p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-9 border border-white/10 bg-transparent text-xs text-white/75 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <Link href="/app/compliance">
                    View compliance record
                    <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </SettingsCard>
          </aside>
        </div>
      </section>
    </>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#0e1420] p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-white/45">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  defaultValue,
  readOnly = false,
}: {
  label: string;
  defaultValue: string;
  readOnly?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-white/50">
        {label}
        {readOnly && (
          <span className="ml-2 font-mono text-[10px] text-primary/60">
            · verified
          </span>
        )}
      </Label>
      <Input
        id={id}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className="h-9 border-white/10 bg-white/[0.02] text-sm disabled:opacity-70"
      />
    </div>
  );
}
