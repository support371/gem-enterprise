import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Users,
  Handshake,
  ArrowRight,
  Lock,
  Fingerprint,
  FileCheck,
} from "lucide-react";
import { RequestAccessForm } from "@/components/hub/RequestAccessForm";

export const metadata: Metadata = {
  title: "Request Access — GEM Community Hub",
  description:
    "Apply for access to the GEM Community Hub — a vetted, invitation-only network of operators, investors, and advisors.",
};

const principles = [
  {
    icon: Fingerprint,
    title: "Vetted Membership",
    body: "Every applicant is reviewed for relevance, reputation, and fit. We protect the signal-to-noise ratio so introductions stay meaningful.",
  },
  {
    icon: Lock,
    title: "Discretion by Default",
    body: "Your application, profile, and activity are private. Nothing is indexed publicly, and member lists are never shared with third parties.",
  },
  {
    icon: FileCheck,
    title: "Clear Standards",
    body: "We evaluate against published criteria. If accepted, onboarding is guided. If declined, you will receive a respectful notice within 10 business days.",
  },
];

const audience = [
  {
    icon: Users,
    label: "Operators",
    desc: "Founders and executives running substantive businesses.",
  },
  {
    icon: Handshake,
    label: "Investors",
    desc: "Principals deploying capital with discretion and scale.",
  },
  {
    icon: ShieldCheck,
    label: "Advisors",
    desc: "Specialists trusted by the above to close hard problems.",
  },
];

export default function RequestAccessPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-28 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
            Community Hub · Invitation-Only
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Request Access to the <span className="text-gradient-primary">GEM Community</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
            A vetted network of operators, investors, and advisors. Applications are reviewed
            individually. We respond to every submission.
          </p>
        </div>
      </section>

      {/* Who this is for */}
      <section className="py-14 border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audience.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.label}
                  className="glass-panel rounded-xl border border-border/50 p-6 flex items-start gap-4"
                >
                  <div className="p-2 rounded-md bg-primary/10 border border-primary/20 flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{a.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <RequestAccessForm />
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 md:py-20 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How We Handle Your Application</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Membership is a trust arrangement. Here is what that means in practice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="glass-panel rounded-xl border border-border/50 p-6"
                >
                  <div className="p-2 rounded-md bg-primary/10 border border-primary/20 w-fit mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-4">
              Prefer a direct conversation before applying?
            </p>
            <Link href="/contact">
              <Button variant="outline" className="gap-2">
                Contact Us First <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
