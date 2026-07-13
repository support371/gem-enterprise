"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STEP_SECONDS = 14;

const steps = [
  {
    number: "01",
    title: "Home",
    href: "/",
    purpose: "Introduce GEM Enterprise and its controlled-production model.",
    show:
      "Show Defend. Protect. Prevail., the access-controlled platform description, service areas, request-only catalogue, role-based controls, fail-closed activation, Request Access, and the Trust Center.",
    narration:
      "GEM Enterprise combines cybersecurity, compliance, financial-security coordination, and property-risk services in one controlled platform. Sensitive capabilities activate only after eligibility, scope, provider, jurisdiction, and contractual checks are complete.",
  },
  {
    number: "02",
    title: "Threat Intelligence",
    href: "/intel",
    purpose: "Explain how intelligence and risk information are organized.",
    show:
      "Show cyber, vulnerability, dark-web, financial, property, and geopolitical categories together with the advisory and authenticated-feed boundaries.",
    narration:
      "The intelligence area organizes cyber, financial, property, dark-web, vulnerability, and geopolitical information for review. Public examples remain illustrative unless their source, timestamp, confidence, and affected assets have been verified.",
  },
  {
    number: "03",
    title: "Services",
    href: "/services",
    purpose: "Describe GEM's enterprise operating disciplines.",
    show:
      "Show monitoring and security operations, incident response, dark-web monitoring, authorized testing, asset and physical security, and compliance support.",
    narration:
      "The service suite presents the disciplines available for qualified engagements. Each service is scoped before activation so staffing, response targets, provider coverage, deliverables, limitations, and fees remain accurate.",
  },
  {
    number: "04",
    title: "Store and Channel Catalogue",
    href: "/store",
    purpose: "Show products and service packages without implying automatic activation.",
    show:
      "Show the main catalogue, campaign hub, channel references, product categories, indicative prices, product details, and the request-for-review workflow.",
    narration:
      "The store is a request-only catalogue. A product card or price does not create an order, activate monitoring, begin a subscription, or guarantee delivery. Final scope, provider, price, tax, refund, licensing, and fulfillment terms are confirmed before acceptance.",
  },
  {
    number: "05",
    title: "Community and Team",
    href: "/community",
    purpose: "Explain the people, specialist roles, and collaboration context.",
    show:
      "Show leadership, security-operations roles, collaboration areas, membership pathways, and the professional-verification boundary.",
    narration:
      "The community area explains the people and specialist roles supporting cybersecurity, compliance, property, financial-risk, and client operations. Public names, biographies, certifications, and affiliations must be verified.",
  },
  {
    number: "06",
    title: "Operational Hub",
    href: "/hub",
    purpose: "Present the authenticated enterprise command center.",
    show:
      "Show Threat Command, Compliance Center, Research Lab, Intelligence Archive, protected documents, support channels, and the service-request process.",
    narration:
      "The Operational Hub is the authenticated workspace for threats, compliance, intelligence, documents, service requests, support, audit history, and account operations. Protected records remain behind authentication and entitlement controls.",
  },
  {
    number: "07",
    title: "Resources",
    href: "/resources",
    purpose: "Show research, templates, tools, news, and frequently asked questions.",
    show:
      "Show market insights, downloadable templates, ThreatWatch, ComplianceTracker, vulnerability workflow concepts, news, and the FAQ section.",
    narration:
      "The resources area explains how GEM shares research, operational templates, automation concepts, and curated updates. Client-only materials remain access controlled, versioned, source labeled, and reviewed before distribution.",
  },
  {
    number: "08",
    title: "Company",
    href: "/company",
    purpose: "Explain GEM's mission, values, divisions, leadership, and partnerships.",
    show:
      "Show mission, vision, values, executive oversight, specialist divisions, capabilities, and verified partner or trustee information.",
    narration:
      "The company page explains why GEM exists and how its divisions work together. Public claims about personnel, headcount, credentials, memberships, and partnerships must match verifiable records.",
  },
  {
    number: "09",
    title: "Contact and Escalation",
    href: "/contact",
    purpose: "Route enquiries, support requests, partnerships, and incident escalation.",
    show:
      "Show the enquiry form, contact categories, general and security addresses, support hours, and the active-client emergency pathway.",
    narration:
      "The contact page directs qualified enquiries to the appropriate team. Emergency language, telephone numbers, locations, operating hours, and response-time statements must reflect the verified operating setup.",
  },
  {
    number: "10",
    title: "Access, Login, and Onboarding",
    href: "/get-started",
    purpose: "Move visitors from public information into controlled access.",
    show:
      "Show Request Access, eligibility review, onboarding status, Client Login, role entitlements, approval gates, and the protected-workspace boundary.",
    narration:
      "Applicants submit an enquiry, complete the required review, receive the correct entitlement, and enter only the workspace and capabilities authorized for their role.",
  },
  {
    number: "11",
    title: "TokMetric",
    href: "/tokmetric",
    purpose: "Connect the enterprise website to controlled TikTok content operations.",
    show:
      "Show the TokMetric landing page, product purpose, official authorization model, privacy policy, terms, workspace, and publishing pathway.",
    narration:
      "TokMetric is the controlled content-operations area. TikTok accounts connect only through official authorization. Content moves through preparation, compliance review, human approval, publishing checks, status tracking, analytics labeling, and audit history.",
  },
  {
    number: "12",
    title: "TikTok App Review Workspace",
    href: "/tokmetric/review-demo",
    purpose: "Show the review-specific connector, content, approval, and audit story.",
    show:
      "Show readiness states, connector authorization status, demo content records, the end-to-end review story, audit history, and the recording checklist.",
    narration:
      "This workspace is built for the TikTok app-review recording. It truthfully distinguishes demo-ready controls from capabilities that remain blocked until official authorization, approved scopes, and platform confirmation are available.",
  },
  {
    number: "13",
    title: "Real Sandbox Publishing Flow",
    href: "/tokmetric/publishing",
    purpose: "Finish with the action TikTok must verify in the real submission recording.",
    show:
      "Record the real Sandbox authorization, requested scopes, account return, connected profile, content selection, caption and privacy settings, explicit user approval, upload or publish result, status history, audit trail, and disconnect control.",
    narration:
      "The public website tour provides context. The final TikTok submission must show the real Sandbox authorization and requested product action. Never expose passwords, client secrets, access tokens, private customer records, or unsupported claims.",
  },
] as const;

export default function EnterpriseGuidedDemoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const current = steps[currentIndex];

  const overallProgress = useMemo(() => {
    const completed = currentIndex * STEP_SECONDS + elapsed;
    return Math.min(100, (completed / (steps.length * STEP_SECONDS)) * 100);
  }, [currentIndex, elapsed]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakCurrent = useCallback(() => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${current.title}. ${current.narration}`);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [current, voiceEnabled]);

  const moveTo = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(steps.length - 1, index));
      stopSpeech();
      setCurrentIndex(safeIndex);
      setElapsed(0);
    },
    [stopSpeech],
  );

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      stopSpeech();
      return;
    }

    speakCurrent();
    intervalRef.current = setInterval(() => {
      setElapsed((value) => {
        const next = value + 0.1;
        if (next < STEP_SECONDS) return next;

        setCurrentIndex((index) => {
          if (index >= steps.length - 1) {
            setIsPlaying(false);
            return index;
          }
          return index + 1;
        });
        return 0;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [currentIndex, isPlaying, speakCurrent, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  const restart = () => {
    moveTo(0);
    setIsPlaying(true);
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeech();
    setVoiceEnabled((value) => !value);
  };

  return (
    <main className="min-h-screen bg-[#061019] text-white">
      <header className="border-b border-white/10 bg-[#09131f]">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              GEM Enterprise guided demonstration
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Full website and TikTok review walkthrough</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Play the complete page-by-page story, open any live page, and use the narration panel as the recording script.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/enterprise-demo" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/[0.06]">
              Back to overview
            </Link>
            <Link href="/tokmetric/review-demo" className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-[#06111b] hover:bg-cyan-200">
              Review workspace
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 overflow-hidden rounded-full bg-white/10">
          <div className="h-2 bg-cyan-300 transition-[width] duration-100" style={{ width: `${overallProgress}%` }} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
          <article className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0a1722] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden gap-1.5 sm:flex">
                  <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-300/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="truncate rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white/55">
                  gemcybersecurityassist.com{current.href === "/" ? "" : current.href}
                </div>
              </div>
              <Link
                href={current.href}
                target="_blank"
                className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/65 hover:bg-white/10 hover:text-white"
              >
                Open live <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="relative aspect-[16/10] min-h-[430px] bg-white">
              <iframe
                key={current.href}
                src={current.href}
                title={`${current.title} live page preview`}
                className="absolute inset-0 h-full w-full border-0"
                loading="eager"
              />
            </div>
          </article>

          <aside className="flex min-h-[620px] flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Step {current.number} of {steps.length}</p>
                <h2 className="mt-2 text-2xl font-bold">{current.title}</h2>
              </div>
              <button
                type="button"
                onClick={toggleVoice}
                className="rounded-xl border border-white/10 p-2.5 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label={voiceEnabled ? "Disable spoken narration" : "Enable spoken narration"}
              >
                {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Page purpose</p>
              <p className="mt-2 text-sm leading-6 text-white/75">{current.purpose}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">What to show</p>
              <p className="mt-2 text-sm leading-6 text-white/65">{current.show}</p>
            </div>

            <div className="mt-4 flex-1 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Suggested narration</p>
              <p className="mt-2 text-sm leading-7 text-white/70">{current.narration}</p>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                <span>{Math.floor(elapsed)} seconds</span>
                <span>{STEP_SECONDS} seconds</span>
              </div>
              <div className="overflow-hidden rounded-full bg-white/10">
                <div className="h-1.5 bg-emerald-300 transition-[width] duration-100" style={{ width: `${Math.min(100, (elapsed / STEP_SECONDS) * 100)}%` }} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[auto_1fr_auto] gap-2">
              <button
                type="button"
                onClick={() => moveTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="rounded-xl border border-white/10 p-3 text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((value) => !value)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-[#06111b] hover:bg-cyan-200"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isPlaying ? "Pause" : "Play guided demo"}
              </button>
              <button
                type="button"
                onClick={() => moveTo(currentIndex + 1)}
                disabled={currentIndex === steps.length - 1}
                className="rounded-xl border border-white/10 p-3 text-white/70 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={restart}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/[0.06] hover:text-white"
            >
              <RotateCcw className="h-4 w-4" /> Restart from Home
            </button>
          </aside>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => moveTo(index)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  index === currentIndex
                    ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                    : index < currentIndex
                      ? "border-emerald-300/20 bg-emerald-300/[0.05] text-white/65"
                      : "border-white/10 bg-white/[0.025] text-white/45 hover:bg-white/[0.06]"
                }`}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em]">{step.number}</span>
                <span className="mt-1 block text-sm font-semibold">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-50/75">
          <strong className="text-amber-100">Final recording requirement:</strong> this guided player explains the complete enterprise story. TikTok's submitted review video must still show the real Sandbox authorization, every requested product and scope, account return, content preparation, user approval, upload or publishing result, status, audit history, and disconnect control.
        </div>
      </section>
    </main>
  );
}
