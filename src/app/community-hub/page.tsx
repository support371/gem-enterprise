import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Globe,
  MessageSquare,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "GEM Community Preview" },
  description:
    "Fictional interface preview of planned GEM community capabilities. No live members, opportunities, events, secure messaging, or verified network are represented.",
};

const sections = [
  {
    icon: Users,
    title: "Member Circles Preview",
    href: "/community-hub/circles",
    desc: "Interface concept for topic-focused groups. The people, counts, organizations, discussions, and membership states shown in this preview are fictional sample data.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f2294c5d6_generated_image.png",
    imgAlt: "Illustrative community-circle interface concept",
  },
  {
    icon: Calendar,
    title: "Events Preview",
    href: "/community-hub/events",
    desc: "Interface concept for future webinars, briefings, and roundtables. Displayed hosts, dates, speakers, registrations, and attendance are not live commitments.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/fe8b6bcec_generated_image.png",
    imgAlt: "Illustrative event and briefing interface concept",
  },
  {
    icon: BookOpen,
    title: "Knowledge Library Preview",
    href: "/community-hub/knowledge",
    desc: "Interface concept for sourced guides and resources. Items must be reviewed for authorship, accuracy, publication date, permissions, and update status before production use.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png",
    imgAlt: "Illustrative knowledge-library interface concept",
  },
  {
    icon: MessageSquare,
    title: "Messaging Preview",
    href: "/community-hub/messages",
    desc: "Interface concept only. This page does not claim that end-to-end encryption, a document vault, message delivery, retention, or production communication security has been activated.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c0b3cf9af_generated_image.png",
    imgAlt: "Illustrative secure-messaging interface concept",
  },
  {
    icon: Globe,
    title: "Opportunity Preview",
    href: "/community-hub/opportunities",
    desc: "Fictional marketplace interface for design testing. No displayed opportunity, sponsor, capital amount, deadline, verification badge, or introduction is real or available for transaction.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/9b9d1f784_generated_image.png",
    imgAlt: "Illustrative opportunity-marketplace interface concept",
  },
];

export default function CommunityHubPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden pb-0 pt-32">
        <div className="relative h-[500px]">
          <Image
            src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f2294c5d6_generated_image.png"
            alt="Illustrative community-platform interface concept"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 flex items-end pb-16">
            <div className="container mx-auto max-w-7xl px-6">
              <Badge className="mb-4 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs uppercase tracking-widest text-amber-200">
                Fictional interface preview
              </Badge>
              <h1 className="mb-4 text-5xl font-black text-white md:text-7xl">
                GEM Community Preview
              </h1>
              <p className="max-w-2xl text-xl text-slate-300">
                A design and workflow preview for possible future collaboration features.
                It does not represent a live client network, active marketplace, verified
                membership directory, production messaging system, or current event program.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                href={section.href}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all hover:-translate-y-1 hover:border-cyan-500/30"
              >
                <div className="relative h-48">
                  <Image
                    src={section.img}
                    alt={section.imgAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/15">
                    <Icon className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                  </div>
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/70">
                    Sample interface
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-cyan-400">
                    {section.title}
                  </h2>
                  <p className="mb-4 text-sm leading-relaxed text-slate-400">{section.desc}</p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-cyan-400 transition-all group-hover:gap-2">
                    Review preview <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-24">
        <div className="container mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-black text-white">
              Production access remains unavailable
            </h2>
            <p className="mb-5 leading-relaxed text-slate-400">
              Before this area can become a real network, GEM must replace every sample record
              with consented and verified data, define moderation and eligibility rules, test
              authorization boundaries, and prove the security and retention controls for each
              communication feature.
            </p>
            <p className="mb-8 leading-relaxed text-slate-400">
              No confidentiality, encryption, investment verification, event availability, or
              member qualification should be inferred from this preview.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full bg-cyan-400 px-6 font-semibold text-black hover:bg-cyan-500">
                <Link href="/contact?subject=community-preview">Ask about future access</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 px-6 font-semibold text-white hover:bg-white/10">
                <Link href="/trust-center">Review Trust Center</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-2xl">
            <Image
              src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1756905aa_generated_image.png"
              alt="Illustrative collaboration-platform concept"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/70">
              AI-generated illustration
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
