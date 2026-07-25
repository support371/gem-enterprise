"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ExternalLink,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const channelOptions = [
  "EMAIL",
  "LINKEDIN",
  "FACEBOOK",
  "INSTAGRAM",
  "X",
  "TIKTOK",
  "YOUTUBE",
  "NEXTDOOR",
] as const;

type Channel = (typeof channelOptions)[number];

type CampaignResult = {
  campaignTitle: string;
  campaignSummary: string;
  audienceSummary: string;
  valueProposition: string;
  emailSubject: string;
  previewText: string;
  emailBody: string;
  landingPageHeadline: string;
  landingPageBody: string;
  socialPosts: Array<{ channel: Channel; content: string; callToAction: string }>;
  complianceFindings: string[];
  requiredDisclosures: string[];
  prohibitedClaimsDetected: string[];
  recommendedMetrics: string[];
};

function readError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: unknown }).error;
  return typeof error === "string" ? error : fallback;
}

export default function ManusCampaignPage() {
  const [objective, setObjective] = useState("");
  const [service, setService] = useState("");
  const [audience, setAudience] = useState("");
  const [location, setLocation] = useState("United States");
  const [offer, setOffer] = useState("");
  const [callToAction, setCallToAction] = useState("Request a consultation");
  const [constraints, setConstraints] = useState("");
  const [channels, setChannels] = useState<Channel[]>(["EMAIL", "LINKEDIN", "FACEBOOK"]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskUrl, setTaskUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "running" | "waiting" | "complete" | "error">("idle");
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedChannels = useMemo(() => new Set(channels), [channels]);

  function toggleChannel(channel: Channel) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  }

  async function startGeneration(event: React.FormEvent) {
    event.preventDefault();
    setStatus("starting");
    setError("");
    setResult(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/manus/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          service,
          audience,
          location: location || undefined,
          channels,
          offer: offer || undefined,
          callToAction,
          constraints: constraints || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setStatus("error");
        setError(readError(payload, "The Manus campaign task could not be started."));
        return;
      }

      setTaskId(payload.task?.taskId ?? null);
      setTaskUrl(payload.task?.taskUrl ?? null);
      setStatus("running");
    } catch {
      setStatus("error");
      setError("The campaign request could not reach the GEM server.");
    }
  }

  useEffect(() => {
    if (!taskId || status !== "running") return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/manus/tasks/${encodeURIComponent(taskId)}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setStatus("error");
          setError(readError(payload, "The Manus task status could not be read."));
          return;
        }
        if (payload.status === "complete" && payload.result) {
          setResult(payload.result as CampaignResult);
          setStatus("complete");
          return;
        }
        if (payload.status === "waiting") {
          setStatus("waiting");
          setError(payload.message || "Manus requires input before it can continue.");
          return;
        }
        if (payload.status === "error") {
          setStatus("error");
          setError(payload.message || "The Manus task failed.");
          return;
        }
        setStatus("running");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setError("The GEM server could not retrieve the Manus task.");
        }
      }
    }, 4_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [status, taskId]);

  async function saveDraft() {
    if (!result) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.campaignTitle,
          subject: result.emailSubject,
          body: result.emailBody,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(readError(payload, "The generated campaign could not be saved."));
        return;
      }
      setSaved(true);
    } catch {
      setError("The generated campaign could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const active = status === "starting" || status === "running";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" className="mt-1 text-slate-400 hover:text-white">
            <Link href="/app/admin/campaigns"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-violet-300">
              <Sparkles className="h-3.5 w-3.5" /> Manus Campaign Agent
            </div>
            <h1 className="text-2xl font-bold text-white">Generate a governed campaign package</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
              Manus researches and drafts the campaign. GEM keeps the output private, unapproved, and publication-disabled until a human reviews and saves it.
            </p>
          </div>
        </div>
        <Badge className="w-fit border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Draft-only boundary
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader><CardTitle className="text-sm text-white">Campaign brief</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={startGeneration} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Objective</label>
                <textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={3} required minLength={10} placeholder="Generate qualified consultation requests for GEM's managed cybersecurity services." className="w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Service or product</label>
                  <Input value={service} onChange={(event) => setService(event.target.value)} required placeholder="Business Monitor" className="border-white/10 bg-white/5 text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Location</label>
                  <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="United States" className="border-white/10 bg-white/5 text-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Target audience</label>
                <textarea value={audience} onChange={(event) => setAudience(event.target.value)} rows={3} required minLength={5} placeholder="Small property-management firms that need security monitoring and incident-readiness support." className="w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="mb-2 block text-xs text-slate-400">Channels</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {channelOptions.map((channel) => (
                    <label key={channel} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${selectedChannels.has(channel) ? "border-violet-400/40 bg-violet-500/15 text-violet-200" : "border-white/10 bg-white/5 text-slate-400"}`}>
                      <input type="checkbox" checked={selectedChannels.has(channel)} onChange={() => toggleChannel(channel)} className="accent-violet-400" />
                      {channel}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Offer guidance</label>
                <Input value={offer} onChange={(event) => setOffer(event.target.value)} placeholder="Free initial scope review; do not invent pricing or guarantees." className="border-white/10 bg-white/5 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Call to action</label>
                <Input value={callToAction} onChange={(event) => setCallToAction(event.target.value)} required className="border-white/10 bg-white/5 text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Additional constraints</label>
                <textarea value={constraints} onChange={(event) => setConstraints(event.target.value)} rows={3} placeholder="Jurisdiction, wording, brand, compliance, or exclusion requirements." className="w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
              <Button type="submit" disabled={active || channels.length === 0} className="w-full gap-2 bg-violet-400 text-black hover:bg-violet-300">
                {active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {status === "starting" ? "Starting Manus…" : status === "running" ? "Manus is working…" : "Generate campaign package"}
              </Button>
              <p className="text-xs leading-relaxed text-slate-600">This operation consumes Manus task credits. It does not send email, publish content, spend advertising funds, or contact prospects.</p>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3 text-sm text-white">
              <span>Generated package</span>
              {taskUrl && (
                <a href={taskUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-normal text-violet-300 hover:text-violet-200">
                  Open private task <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                {active ? <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-300" /> : <Sparkles className="mb-4 h-8 w-8 text-slate-600" />}
                <p className="text-sm font-medium text-slate-300">{active ? "Manus is researching and drafting" : "No campaign generated yet"}</p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-600">Completed output will include the email draft, landing-page copy, social variants, compliance findings, disclosures, and measurement recommendations.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <h2 className="text-lg font-semibold text-white">{result.campaignTitle}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{result.campaignSummary}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Email subject</p>
                  <p className="mt-1 text-sm font-medium text-white">{result.emailSubject}</p>
                  <p className="mt-1 text-xs text-slate-500">{result.previewText}</p>
                  <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{result.emailBody}</div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Landing page</p>
                    <p className="mt-2 text-sm font-medium text-white">{result.landingPageHeadline}</p>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-400">{result.landingPageBody}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Governance review</p>
                    <p className="mt-2 text-xs text-slate-400">Findings: {result.complianceFindings.length}</p>
                    <p className="mt-1 text-xs text-slate-400">Disclosures: {result.requiredDisclosures.length}</p>
                    <p className="mt-1 text-xs text-slate-400">Prohibited claims detected: {result.prohibitedClaimsDetected.length}</p>
                  </div>
                </div>
                {result.socialPosts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Social variants</p>
                    {result.socialPosts.map((post, index) => (
                      <div key={`${post.channel}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <Badge className="mb-2 border-white/10 bg-white/10 text-slate-300">{post.channel}</Badge>
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={saveDraft} disabled={saving || saved} className="w-full gap-2 bg-cyan-400 text-black hover:bg-cyan-300">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved as GEM draft" : saving ? "Saving draft…" : "Save email as unapproved GEM draft"}
                </Button>
                {saved && <p className="text-center text-xs text-emerald-300">Draft saved. Sending remains separately approval-gated.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
