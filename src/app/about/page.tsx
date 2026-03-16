import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Eye,
  Lock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
} from "lucide-react";

export const metadata: Metadata = { title: "About" };

const metrics = [
  {
    icon: Clock,
    value: "10+",
    label: "Years of Operation",
    description: "A decade of institutional-grade security intelligence",
  },
  {
    icon: Users,
    value: "500+",
    label: "Clients Served",
    description: "Enterprises, family offices, and institutional clients",
  },
  {
    icon: DollarSign,
    value: "$2B+",
    label: "Assets Protected",
    description: "In secured financial and real estate portfolios",
  },
  {
    icon: Shield,
    value: "95+",
    label: "Team Members",
    description: "Specialists across security, finance, and operations",
  },
];

const coreValues = [
  {
    icon: Shield,
    title: "Integrity",
    description:
      "Every recommendation we make, every assessment we deliver, and every engagement we undertake is governed by an unwavering commitment to honesty and ethical conduct. We will never recommend a course of action that conflicts with our clients' best interests.",
  },
  {
    icon: Eye,
    title: "Intelligence",
    description:
      "We operate from evidence, not assumption. Our analysts, advisors, and engineers are trained to think adversarially — anticipating threats before they materialize and making decisions grounded in rigorous analysis of the current threat landscape.",
  },
  {
    icon: Lock,
    title: "Independence",
    description:
      "GEM Enterprise is not a reseller, integrator, or affiliate of any technology vendor. Our assessments and recommendations are entirely independent of commercial incentives. What we advise is what we genuinely believe is correct for your organization.",
  },
];

const differentiators = [
  {
    title: "Intelligence-Led Operations",
    description:
      "GEM's security operations are driven by proprietary threat intelligence, not reactive signature-based detection. We understand the adversary — their tools, techniques, and motivations — and use that knowledge to stay ahead of emerging threats.",
    points: [
      "Proactive threat hunting across client environments",
      "Real-time intelligence correlation from global sources",
      "Adversary simulation informed by current threat actor TTPs",
    ],
  },
  {
    title: "Institutional-Grade Discipline",
    description:
      "Our processes, documentation, and client communication standards are modeled on institutional finance — where rigor, confidentiality, and accountability are non-negotiable. We treat every engagement with the same discipline as a high-stakes transaction.",
    points: [
      "Formal engagement structures with defined SLAs",
      "Secure, audited communication and data handling",
      "Executive-level reporting designed for board consumption",
    ],
  },
  {
    title: "Convergence of Expertise",
    description:
      "Most security firms specialize in a single domain. GEM Enterprise combines cybersecurity, financial security, and real estate protection under one roof — enabling integrated risk management that reflects the true complexity of modern enterprise operations.",
    points: [
      "Unified risk view across cyber, financial, and physical domains",
      "Cross-domain threat correlation and response coordination",
      "Single trusted advisor relationship for complex clients",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
            About GEM Enterprise
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Purpose-Built for{" "}
            <span className="text-gradient-primary">Enterprise Security</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            GEM Enterprise was founded on a single conviction: that qualified organizations deserve
            access to security intelligence and operational protection at the same level historically
            available only to the world's most powerful institutions.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
                Who We Are
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                An Intelligence-First Security Organization
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  GEM Enterprise is a cybersecurity-first enterprise platform serving qualified clients across
                  financial services, real estate, and complex corporate environments. We are not a traditional
                  managed security provider — we operate as a strategic security partner, embedded in the
                  decision-making processes of the organizations we protect.
                </p>
                <p>
                  Our team comprises former intelligence professionals, institutional security architects,
                  financial regulators, and legal specialists — unified by a shared commitment to protecting
                  the assets, operations, and reputations of the organizations that trust us.
                </p>
                <p>
                  We accept a limited number of clients to ensure that every engagement receives the depth
                  of attention it demands. GEM is not a high-volume service firm. We are a high-trust
                  advisory and operations partner.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.label} className="glass-panel bento-card border-primary/20 text-center p-6">
                    <CardContent className="p-0">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 w-fit mx-auto mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-gradient-primary mb-1">{metric.value}</div>
                      <div className="text-sm font-semibold mb-1">{metric.label}</div>
                      <div className="text-xs text-muted-foreground">{metric.description}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
              Our Story
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Founded to Close a Critical Gap</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              GEM Enterprise was established in response to a clear and growing problem: the cybersecurity
              gap between large multinational corporations and the rest of the enterprise market.
              Mid-market firms, family offices, institutional real estate operators, and qualified
              individual investors were operating with enterprise-scale risk exposure and consumer-grade
              security capabilities.
            </p>
            <p>
              Our founders — veterans of government intelligence agencies, major financial institutions,
              and global law firms — recognized that this gap was not a matter of market failure but of
              access. The tools, talent, and intelligence required to operate at a truly secure level
              existed, but they were siloed within organizations that had no incentive to share them.
            </p>
            <p>
              GEM was built to change that. By assembling a team of institutional-grade specialists
              and building a platform capable of serving complex, qualified clients at scale, we
              created the first enterprise security platform purpose-built for the organizations
              that need it most — but have historically been underserved.
            </p>
            <p>
              Today, GEM Enterprise operates across multiple jurisdictions, protecting financial assets,
              real estate portfolios, and enterprise operations for a carefully selected roster of
              qualified clients who depend on us to be right — every time.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
              Core Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Integrity. Intelligence. Independence.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three values that govern every decision we make, every engagement we accept, and every
              relationship we maintain.
            </p>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="glass-panel bento-card border-primary/20">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 w-fit mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Sets GEM Apart */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
              Differentiation
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Sets GEM Apart</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three structural advantages that define the GEM Enterprise approach.
            </p>
          </div>
          <div className="space-y-8">
            {differentiators.map((diff, index) => (
              <Card key={diff.title} className="glass-panel bento-card border-border/50">
                <CardContent className="pt-8 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-1 flex-shrink-0">
                      <span className="text-4xl font-bold font-mono text-primary/30">
                        0{index + 1}
                      </span>
                    </div>
                    <div className="md:col-span-5">
                      <h3 className="text-xl font-bold mb-3">{diff.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{diff.description}</p>
                    </div>
                    <div className="md:col-span-6">
                      <ul className="space-y-3">
                        {diff.points.map((point) => (
                          <li key={point} className="flex gap-3 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-12 border-primary/20">
            <TrendingUp className="h-10 w-10 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Work with{" "}
              <span className="text-gradient-primary">GEM Enterprise</span>?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Qualified organizations can begin the engagement process today. Our team will guide you
              through eligibility, onboarding, and full platform access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-started">
                <Button size="lg" className="gap-2 glow-cyan">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2">
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
