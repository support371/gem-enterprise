import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UserCheck,
  Building2,
  Shield,
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Globe,
  FileText,
  ArrowRight,
  Scale,
  Lock,
} from "lucide-react";

export const metadata: Metadata = { title: "Eligibility Check" };

const entityTypes = [
  {
    icon: UserCheck,
    title: "Individual",
    subtitle: "Accredited Investor",
    description:
      "Natural persons who qualify as accredited investors under applicable securities regulations. Eligibility is based on net worth, income history, or relevant professional credentials as defined by regulatory standards.",
    requirements: [
      "Meets applicable net worth threshold (excluding primary residence)",
      "Meets applicable annual income qualification",
      "Or holds qualifying professional credential (Series 65, CFA, etc.)",
      "Valid government-issued identity document",
      "Proof of residency in an accepted jurisdiction",
      "Accredited investor certification",
    ],
    badge: "Individual",
    href: "/client-login",
  },
  {
    icon: Building2,
    title: "Business",
    subtitle: "Corporate Entity",
    description:
      "Registered companies, corporations, and business entities that are either institutional investors by nature or that meet applicable asset thresholds. Includes both domestic and qualified foreign entities.",
    requirements: [
      "Active business registration in accepted jurisdiction",
      "Meets applicable institutional asset threshold",
      "Or all equity owners individually qualify as accredited investors",
      "Certificate of incorporation or equivalent formation document",
      "Authorized signatory documentation",
      "Beneficial ownership disclosure (for applicable entities)",
    ],
    badge: "Business",
    href: "/client-login",
  },
  {
    icon: Shield,
    title: "Trust",
    subtitle: "Qualified Trust",
    description:
      "Trusts with substantial assets under management and qualified trustees. Revocable and irrevocable trusts may qualify under different criteria depending on structure and applicable regulatory framework.",
    requirements: [
      "Trust assets above applicable threshold",
      "Or all equity owners/grantors qualify as accredited investors",
      "Trust agreement and formation documents",
      "Trustee identification and authorization",
      "Beneficial interest holder disclosure",
      "Tax identification documentation",
    ],
    badge: "Trust",
    href: "/client-login",
  },
  {
    icon: Users,
    title: "Family Office",
    subtitle: "Single or Multi-Family",
    description:
      "Single-family and multi-family offices that manage wealth and investments for one or more qualifying family units. GEM Enterprise is well-suited to the complex, multi-asset risk profiles of family office clients.",
    requirements: [
      "Established family office structure",
      "Assets under management above applicable threshold",
      "Family office exemption or registration documentation",
      "Investment manager authorization",
      "Beneficial ownership and family relationship documentation",
      "Compliance officer or designated contact",
    ],
    badge: "Family Office",
    href: "/client-login",
  },
];

const acceptedJurisdictions = [
  { region: "North America", jurisdictions: ["United States (all states)", "Canada (select provinces)"] },
  { region: "Europe", jurisdictions: ["United Kingdom", "European Union member states", "Switzerland"] },
  { region: "Asia-Pacific", jurisdictions: ["Singapore", "Australia", "Hong Kong SAR"] },
  { region: "Other", jurisdictions: ["Select additional jurisdictions — contact us for confirmation"] },
];

const requiredDocuments = [
  {
    category: "Identity Verification",
    icon: UserCheck,
    documents: [
      "Government-issued photo identification (passport preferred)",
      "Secondary identity document",
      "Selfie verification for individual applicants",
    ],
  },
  {
    category: "Entity Documentation",
    icon: Building2,
    documents: [
      "Certificate of incorporation, formation, or trust agreement",
      "Operating agreement, bylaws, or trust declaration",
      "Certificate of good standing (entities)",
      "Beneficial ownership register",
    ],
  },
  {
    category: "Financial Qualification",
    icon: Briefcase,
    documents: [
      "Accredited investor certification or supporting documentation",
      "Recent financial statements or net worth attestation",
      "Income verification (for income-based qualification)",
      "Audited financial statements (for institutional entities)",
    ],
  },
  {
    category: "Source of Funds",
    icon: FileText,
    documents: [
      "Source of funds declaration",
      "Supporting documentation (employment, business income, investment records)",
      "Bank statements or custodian statements",
    ],
  },
];

export default function EligibilityPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
            Eligibility Check
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Eligibility{" "}
            <span className="text-gradient-primary">Requirements</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            GEM Enterprise is available to qualified individuals, business entities, trusts, and family
            offices. Review the requirements below to determine whether you qualify for access.
          </p>
        </div>
      </section>

      {/* Who Qualifies Overview */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="glass-panel rounded-2xl p-8 border-primary/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Who Qualifies</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    GEM Enterprise restricts access to qualified investors and institutional clients in accordance
                    with applicable securities and financial regulations. This restriction exists to ensure
                    that our services are appropriate for the risk profiles and sophistication levels of our clients.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Individual Accredited Investors", icon: UserCheck },
                  { label: "Qualified Business Entities", icon: Building2 },
                  { label: "Qualified Trusts", icon: Shield },
                  { label: "Family Offices", icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="text-center p-4 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground leading-snug">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entity Type Selection */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Select Your Entity Type</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each entity type has distinct eligibility criteria and documentation requirements.
              Select the category that best describes you or your organization to begin.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entityTypes.map((entity) => {
              const Icon = entity.icon;
              return (
                <Card key={entity.title} className="glass-panel bento-card border-border/50 flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{entity.title}</CardTitle>
                          <p className="text-xs text-primary font-mono mt-0.5">{entity.subtitle}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono flex-shrink-0">
                        {entity.badge}
                      </Badge>
                    </div>
                    <CardDescription className="leading-relaxed">{entity.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="mb-6">
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-3">
                        Key Requirements
                      </p>
                      <ul className="space-y-2">
                        {entity.requirements.map((req) => (
                          <li key={req} className="flex gap-2.5 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href={entity.href}>
                      <Button className="w-full gap-2">
                        Start Application <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirement Details */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Jurisdictions */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Globe className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-bold">Accepted Jurisdictions</h2>
              </div>
              <Separator className="mb-8" />
              <div className="space-y-6">
                {acceptedJurisdictions.map((region) => (
                  <div key={region.region}>
                    <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
                      {region.region}
                    </p>
                    <ul className="space-y-1.5">
                      {region.jurisdictions.map((jurisdiction) => (
                        <li key={jurisdiction} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {jurisdiction}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Applicants from jurisdictions not listed above are not currently eligible. Jurisdictions
                  subject to international sanctions, FATF grey or black listing, or applicable restrictions
                  are excluded regardless of individual qualifications.
                </p>
              </div>
            </div>

            {/* Documentation Required */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <FileText className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-bold">Documentation Required</h2>
              </div>
              <Separator className="mb-8" />
              <div className="space-y-6">
                {requiredDocuments.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.category}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">{category.category}</p>
                      </div>
                      <ul className="space-y-1.5 pl-6">
                        {category.documents.map((doc) => (
                          <li key={doc} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-1.5 text-xs flex-shrink-0">·</span>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 md:py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Card className="glass-panel border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30 flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Eligibility Review Disclaimer</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Submission of an application does not guarantee access to GEM Enterprise services.
                    All applications are subject to internal eligibility review, KYC/AML screening, and
                    compliance assessment. GEM Enterprise reserves the right to decline any application
                    at its sole discretion without disclosure of specific reasons.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Eligibility determinations are not investment advice, legal advice, or a representation
                    regarding the suitability of any service for your particular circumstances. We strongly
                    recommend consulting with qualified legal and financial advisors before proceeding.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Net worth thresholds, income requirements, and qualifying criteria referenced herein are
                    general descriptions only and are subject to applicable law in your jurisdiction of
                    residence. Specific thresholds are not disclosed publicly and will be communicated
                    during the onboarding process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/compliance-notice">
              <Button variant="outline" className="gap-2">
                <Scale className="h-4 w-4" />
                Read Compliance Notice
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="gap-2">
                <Lock className="h-4 w-4" />
                Contact Compliance Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-10 border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Begin Your{" "}
              <span className="text-gradient-primary">Application</span>?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
              Select your entity type above and begin the secure application process.
              If you have questions about eligibility, our compliance team is available to assist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/client-login">
                <Button size="lg" className="gap-2 glow-cyan">
                  Start Application <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/get-started">
                <Button size="lg" variant="outline" className="gap-2">
                  Back to Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
