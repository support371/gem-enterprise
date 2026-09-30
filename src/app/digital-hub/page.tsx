import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, CircleDot, ExternalLink, ShieldCheck } from "lucide-react";
import { DigitalHubClient, ReferralActions, WalletConnector } from "./DigitalHubClient";
import { publicDigitalHubCatalog } from "@/lib/digital-hub/catalog";

export const metadata: Metadata = {
  title: "Digital Hub | GEM Enterprise",
  description:
    "GEM Enterprise digital hub for verified services, referral routes, wallet connections, and governed provider access.",
};

const journey = [
  ["Discover", "Find a verified service, useful briefing, or referral route."],
  ["Qualify", "See availability, boundaries, eligibility, and required provider connections."],
  ["Agree", "Confirm scope, price, timing, responsibilities, and required approvals."],
  ["Deliver", "Move approved work into the authenticated GEM workspace."],
  ["Review", "Measure completion, provider health, support needs, and next actions."],
];

export default function DigitalHubPage() {
  const hub = publicDigitalHubCatalog();

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#111714]">
      <section className="border-b border-black/10 px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div>
            <p className="mb-5 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full border border-black bg-lime-300" />
              GEM Digital Hub · validated application build
            </p>
            <h1 className="max-w-4xl text-6xl font-black leading-[.88] tracking-[-.065em] sm:text-8xl lg:text-9xl">
              Build skill.<br />Make moves.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            A server-driven route into GEM services, crypto market intelligence, provider connections,
            referrals, and client operations. Status labels come from application configuration rather
            than static claims.
          </p>
        </div>
      </section>

      <nav className="sticky top-0 z-20 border-b border-black/10 bg-white/90 px-5 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-x-7 gap-y-2 py-3 font-mono text-xs font-bold uppercase tracking-wide text-slate-600">
          <a href="#referral" className="hover:text-black">Referral</a>
          <a href="#connections" className="hover:text-black">Connections</a>
          <a href="#services" className="hover:text-black">Services</a>
          <a href="#journey" className="hover:text-black">Client journey</a>
          <a href="/api/digital-hub" className="ml-auto inline-flex items-center gap-1 text-black">
            Live API <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </nav>

      <section id="referral" className="bg-lime-300 px-5 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/60">BTCC referral</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Start with the verified route.</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-black/70">{hub.referral.disclosure}</p>
          </div>
          <ReferralActions code={hub.referral.code} href={hub.referral.href} />
        </div>
      </section>

      <section id="connections" className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-5 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Connect</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">One hub. Verified routes.</h2>
            </div>
            <p className="max-w-2xl text-slate-600">
              External routes are shown as live only when the server catalog identifies a real destination.
              Account authentication and provider verification remain with the destination provider.
            </p>
          </div>

          <div className="mb-8 divide-y divide-black/10 border-y border-black/10">
            {hub.connections.map((connection) => (
              <div key={connection.label} className="grid gap-3 py-6 sm:grid-cols-[180px_1fr_auto] sm:items-center">
                <h3 className="font-bold">{connection.label}</h3>
                <p className="text-sm text-slate-600">{connection.disclosure ?? "Verified public route."}</p>
                <a href={connection.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline underline-offset-4">
                  Open <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>

          <WalletConnector />
        </div>
      </section>

      <section id="services" className="border-y border-black/10 bg-white px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-5 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Services</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Real capability, explicit gates.</h2>
            </div>
            <p className="max-w-2xl text-slate-600">
              The rebuilt hub does not use a paper-trading service lane. Market capability is represented
              by its actual controlled state, and live execution cannot be inferred from a public label.
            </p>
          </div>

          <div className="divide-y divide-black/10 border-y border-black/10">
            {hub.services.map((service, index) => (
              <article key={service.id} className="grid gap-4 py-7 md:grid-cols-[56px_260px_1fr_160px] md:items-start">
                <span className="font-mono text-xs font-bold text-orange-600">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="text-lg font-black">{service.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide">
                  <CircleDot className={`h-3 w-3 ${service.state === "available" ? "text-lime-600" : "text-orange-500"}`} />
                  {service.state}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Operating model</p>
            <h2 className="mt-2 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">From visitor to accountable client operation.</h2>
          </div>
          <div className="grid border border-black/10 bg-black/10 md:grid-cols-5 md:gap-px">
            {journey.map(([title, description], index) => (
              <article key={title} className="min-h-56 bg-[#f4f6f1] p-6">
                <span className="font-mono text-xs font-bold text-orange-600">0{index + 1}</span>
                <h3 className="mt-14 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-lime-300" />
              <h2 className="text-3xl font-black">Backend-enforced boundaries</h2>
            </div>
            <p className="mt-4 max-w-2xl text-slate-400">
              The public API exposes service and route status without exposing credentials. Wallet
              connections remain non-custodial, and provider-controlled capabilities remain gated.
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            {["No seed phrase or private-key collection", "No public-hub custody", "No live-trading claim from a static page", "Referral relationship disclosed"].map((item) => (
              <p key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-lime-300" />{item}</p>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>GEM Enterprise Digital Hub · educational and technology information, not financial advice.</p>
          <a href="/get-started" className="inline-flex items-center gap-2 font-bold text-black">Enter GEM <ArrowRight className="h-4 w-4" /></a>
        </div>
      </footer>
    </main>
  );
}
