import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, Mail, Megaphone, Search, ShieldCheck, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";
import {
  activationGuardrails,
  alreadyATargetCampaign,
  gtmCalendar,
  nurtureSequence,
  referralTracks,
  readinessChecklist,
  seoClusters,
  socialProfileDrafts,
  telegramPack,
  utmContract,
} from "@/lib/market/gtmActivation";

export default function GtmActivationPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-5">
        <Link href="/app/admin/market/operations" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" /> Commercial operations
        </Link>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-300">
              <Target className="h-3.5 w-3.5" /> Governed GTM activation
            </div>
            <h1 className="text-2xl font-bold text-white">GTM Activation Center</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Operator-ready assets for the {foundingBusinessReviewOffer.priceLabel}: 30-day execution calendar,
              nurture sequence, campaign positioning, public checklist, profile drafts, Telegram education,
              referral tracks, SEO clusters, and one attribution contract. This surface drafts and governs work;
              it does not send or publish anything automatically.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href="/app/admin/market/outreach">First-20 workbench</Link></Button>
            <Button asChild variant="outline"><Link href="/app/admin/campaigns">Campaign governance</Link></Button>
            <Button asChild><a href="/resources/business-readiness-checklist" target="_blank" rel="noreferrer">Public checklist <ExternalLink className="h-4 w-4" /></a></Button>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-5">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-semibold text-white">Activation guardrails</h2><div className="mt-3 grid gap-2 lg:grid-cols-2">{activationGuardrails.map((item) => <p key={item} className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 text-slate-300">{item}</p>)}</div></div></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Calendar</p><p className="mt-4 text-3xl font-bold text-white">{gtmCalendar.length} days</p></div>
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Nurture</p><p className="mt-4 text-3xl font-bold text-white">{nurtureSequence.length} emails</p></div>
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Readiness</p><p className="mt-4 text-3xl font-bold text-white">{readinessChecklist.length} questions</p></div>
        <div className="glass-panel rounded-xl p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Profiles</p><p className="mt-4 text-3xl font-bold text-white">{socialProfileDrafts.length}</p></div>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-cyan-300" /><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">30-day program</p><h2 className="text-lg font-semibold text-white">Foundation → authority → campaign → conversion</h2></div></div>
        <div className="grid gap-3 xl:grid-cols-2">{gtmCalendar.map((item) => <Card key={item.day} className="border-white/10 bg-card"><CardContent className="p-5"><div className="flex items-start gap-4"><span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 font-mono text-xs text-cyan-200">{item.day}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{item.deliverable}</h3><Badge variant="outline">{item.phase}</Badge><Badge variant="outline">{item.channel}</Badge></div><p className="mt-2 text-sm text-slate-300">Hook: {item.hook}</p><p className="mt-1 text-xs text-slate-500">CTA: {item.cta}</p></div></div></CardContent></Card>)}</div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><Mail className="h-5 w-5 text-cyan-300" /><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Nurture</p><h2 className="text-lg font-semibold text-white">Four-message governed sequence</h2></div></div>
        <div className="grid gap-4 xl:grid-cols-2">{nurtureSequence.map((email) => <Card key={email.day} className="border-white/10 bg-card"><CardHeader><CardTitle className="text-base text-white">Day {email.day}: {email.subject}</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-xs text-slate-500">{email.purpose}</p><p className="text-sm leading-6 text-slate-300">{email.body}</p><p className="text-xs font-semibold text-cyan-300">CTA: {email.cta}</p></CardContent></Card>)}</div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/10 bg-card"><CardHeader><CardTitle className="flex items-center gap-2 text-white"><Megaphone className="h-4 w-4 text-cyan-300" /> {alreadyATargetCampaign.name}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-6 text-slate-300">{alreadyATargetCampaign.positioning}</p><div><p className="text-xs uppercase tracking-wide text-slate-500">Approved hooks</p>{alreadyATargetCampaign.approvedHooks.map((hook) => <p key={hook} className="mt-2 text-sm text-slate-300">• {hook}</p>)}</div><div><p className="text-xs uppercase tracking-wide text-slate-500">Never claim</p>{alreadyATargetCampaign.prohibitedClaims.map((claim) => <p key={claim} className="mt-2 text-sm text-rose-200">• {claim}</p>)}</div><p className="text-xs font-semibold text-cyan-300">Primary CTA: {alreadyATargetCampaign.primaryCta}</p></CardContent></Card>
        <Card className="border-white/10 bg-card"><CardHeader><CardTitle className="flex items-center gap-2 text-white"><Search className="h-4 w-4 text-cyan-300" /> SEO & attribution</CardTitle></CardHeader><CardContent className="space-y-4">{seoClusters.map((item) => <div key={item.cluster}><p className="text-sm font-semibold text-white">{item.cluster}</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.queries.join(" · ")}</p></div>)}<div className="rounded-xl border border-white/10 p-3"><p className="text-xs uppercase tracking-wide text-slate-500">UTM campaign</p><p className="mt-1 font-mono text-sm text-cyan-300">{utmContract.campaign}</p><p className="mt-2 text-xs leading-5 text-slate-400">{utmContract.rule}</p></div></CardContent></Card>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-cyan-300" /><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Distribution</p><h2 className="text-lg font-semibold text-white">Profile, Telegram and referral drafts</h2></div></div>
        <div className="grid gap-4 xl:grid-cols-2">{socialProfileDrafts.map((profile) => <Card key={profile.platform} className="border-white/10 bg-card"><CardContent className="p-5"><p className="font-semibold text-white">{profile.platform}</p><p className="mt-2 text-sm leading-6 text-slate-300">{profile.bio}</p></CardContent></Card>)}</div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2"><Card className="border-white/10 bg-card"><CardHeader><CardTitle className="text-white">{telegramPack.channelName}</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-slate-300">{telegramPack.description}</p>{telegramPack.launchPosts.map((post) => <p key={post} className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm leading-6 text-slate-300">{post}</p>)}</CardContent></Card><Card className="border-white/10 bg-card"><CardHeader><CardTitle className="text-white">Referral tracks</CardTitle></CardHeader><CardContent className="space-y-3">{referralTracks.map((track) => <div key={track.audience}><p className="text-sm font-semibold text-white">{track.audience}</p><p className="mt-1 text-sm leading-6 text-slate-400">{track.value}</p></div>)}</CardContent></Card></div>
      </section>
    </div>
  );
}
