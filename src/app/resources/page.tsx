import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, FileCheck2, Newspaper, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Resources | GEM Enterprise",
  description:
    "Evidence-led business security, operational-readiness, service-scope, and public intelligence resources from GEM Enterprise.",
};

const publicResources = [
  {
    title: "Business Security & Operations Readiness Checklist",
    description:
      "Ten practical questions for small and growing businesses covering account ownership, MFA, offboarding, payment-change verification, vendors, backups, data, and continuity.",
    href: "/resources/business-readiness-checklist",
    cta: "Open checklist",
    icon: FileCheck2,
  },
  {
    title: "GEM Business Security & Operations Review",
    description:
      "Review the bounded founding scope for qualified small businesses, including what the $199 review includes, excludes, and how a request proceeds through qualification.",
    href: "/business-review",
    cta: "Review scope",
    icon: ShieldCheck,
  },
  {
    title: "GEM Intelligence News",
    description:
      "Browse the public intelligence and news surface. Source attribution and publication status should be reviewed on each item before relying on it for an operational decision.",
    href: "/intel/news",
    cta: "Open news",
    icon: Newspaper,
  },
  {
    title: "Trust Center",
    description:
      "Review GEM's public trust, governance, and operating-boundary information. Capabilities remain subject to configured controls, approved scope, provider readiness, and human authorization where required.",
    href: "/trust-center",
    cta: "Open Trust Center",
    icon: Building2,
  },
] as const;

const resourcePrinciples = [
  "Public educational material does not state or imply that a reader, prospect, or organization is compromised.",
  "Security, staffing, provider, performance, certification, regulatory, and relationship claims require evidence before publication.",
  "Templates, reports, tools, feeds, and client-only capabilities are not advertised as available unless the underlying artifact or production capability is verified.",
  "External standards and advisories should be attributed to their original publisher rather than presented as GEM-authored research.",
] as const;

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden py-24 md:py-32 cyber-grid">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary">
            Controlled public resources
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Practical, evidence-led <span className="text-gradient-primary">resources</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Start with material that is publicly available and tied to a verified GEM service or operating
            surface. Availability of a resource does not activate a service, authorize testing, or create a
            client relationship.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/resources/business-readiness-checklist">
                Start the readiness checklist <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/business-review">View the founding review</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Available now</p>
              <h2 className="text-2xl font-bold">Verified public starting points</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {publicResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Card key={resource.href} className="border-border/60 bg-card/70">
                  <CardHeader>
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">{resource.description}</p>
                    <Button asChild variant="link" className="mt-3 h-auto px-0">
                      <Link href={resource.href}>{resource.cta} <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <h2 className="font-semibold">Publication controls</h2>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {resourcePrinciples.map((principle) => (
                    <p key={principle} className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
                      {principle}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
