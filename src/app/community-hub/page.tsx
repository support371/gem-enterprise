import Link from "next/link";
import Image from "next/image";
import { Users, MessageSquare, Calendar, BookOpen, Globe, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Community Hub | GEM Enterprise",
  description: "Connect with qualified GEM Enterprise clients, access exclusive intelligence, join circles, and collaborate on financial security and investment strategy.",
};

const sections = [
  { icon: Users, title: "Member Circles", href: "/community-hub/circles", desc: "Topic-focused groups for cybersecurity professionals, real estate investors, and financial protection clients. Share intelligence, ask questions, and collaborate.", img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f2294c5d6_generated_image.png", imgAlt: "GEM Community Hub member circles — diverse professionals collaborating in a modern co-working space with warm lighting and community dashboard visible on wall display" },
  { icon: Calendar, title: "Events", href: "/community-hub/events", desc: "Exclusive webinars, roundtables, and intelligence briefings hosted by GEM analysts. Live Q&A sessions with senior cybersecurity and financial security experts.", img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/fe8b6bcec_generated_image.png", imgAlt: "GEM Community events — intelligence briefing session with analysts presenting to attendees in a modern conference setting with curved monitor displays showing threat data" },
  { icon: BookOpen, title: "Knowledge Base", href: "/community-hub/knowledge", desc: "Curated library of threat research, regulatory guides, property fraud alerts, and tactical playbooks — continuously updated by the GEM intelligence team.", img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png", imgAlt: "GEM Knowledge Base — compliance and intelligence resource library with structured documentation on cybersecurity, financial fraud prevention and real estate security" },
  { icon: MessageSquare, title: "Direct Messaging", href: "/community-hub/messages", desc: "Secure, encrypted peer-to-peer messaging between verified GEM clients. All communications are end-to-end encrypted and stored in your document vault.", img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c0b3cf9af_generated_image.png", imgAlt: "GEM Community Hub secure messaging — encrypted digital vault communication system for verified institutional clients" },
  { icon: Globe, title: "Opportunities", href: "/community-hub/opportunities", desc: "Vetted co-investment opportunities, partnership introductions, and strategic referrals — shared exclusively within the GEM client network.", img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/9b9d1f784_generated_image.png", imgAlt: "GEM Community opportunities — institutional investment and partnership networking in a premium financial district setting" },
];

export default function CommunityHubPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        <div className="relative h-[500px]">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f2294c5d6_generated_image.png" alt="GEM Enterprise Community Hub — bright modern co-working space with warm lighting and large glass walls overlooking a city. Groups of verified institutional professionals are connecting, sharing intelligence, and collaborating. A large wall display shows the community dashboard with member circles, event cards, and intelligence feeds." fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
          <div className="absolute inset-0 flex items-end pb-16">
            <div className="container mx-auto px-6 max-w-7xl">
              <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">Community Hub</Badge>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4">The GEM Client Network</h1>
              <p className="text-slate-300 text-xl max-w-2xl">Intelligence sharing, peer collaboration, and exclusive opportunities — exclusively for verified GEM Enterprise clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTIONS GRID */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <Link key={i} href={sec.href} className="group bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all hover:-translate-y-1">
                <div className="relative h-48">
                  <Image src={sec.img} alt={sec.imgAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{sec.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{sec.desc}</p>
                  <div className="flex items-center gap-1 text-cyan-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          )}
        </div>
      </section>

      {/* MEMBERSHIP INFO */}
      <section className="py-24 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-6">Access Requires Verified GEM Membership</h2>
              <p className="text-slate-400 leading-relaxed mb-5">The GEM Community Hub is accessible only to clients who have completed the full onboarding process — KYC verification, entity review, and entitlement approval. This ensures that every member of the network is a verified, qualified operator.</p>
              <p className="text-slate-400 leading-relaxed mb-8">All community interactions are governed by GEM&apos;s confidentiality framework. Intelligence shared within the platform remains within the platform.</p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-6">
                  <Link href="/get-started">Apply for Access</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-6">
                  <Link href="/app/community">Member Login</Link>
                </Button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-[360px]">
              <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1756905aa_generated_image.png" alt="GEM Enterprise verified client network — four senior professionals collaborating in a modern glass-walled meeting room, reviewing intelligence briefings on a large wall display representing the exclusive GEM Community Hub membership" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
