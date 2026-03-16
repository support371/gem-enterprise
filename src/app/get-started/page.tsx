import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
  Building2,
  Briefcase,
  Users,
  DollarSign,
  LogIn,
} from "lucide-react";

export const metadata: Metadata = { title: "Get Started" };

const onboardingSteps = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Check Eligibility",
    description:
      "Review our eligibility criteria and confirm that you or your organization qualifies for GEM Enterprise access. We serve accredited investors, qualified enterprises, family offices, and institutional clients.",
    details: [
      "Review individual and entity criteria",
      "Confirm jurisdiction eligibility",
      "Identify your entity type",
    ],
    cta: "Check Eligibility",
    href: "/eligibility",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Create Account",
    description:
      "Register for a GEM Enterprise account using a valid institutional email address. Account creation initiates the secure onboarding workflow and assigns you a dedicated client intake specialist.",
    details: [
      "Provide organizational details",
      "Set secure authentication credentials",
      "Receive intake confirmation",
    ],
    cta: "Create Account",
    href: "/client-login",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Complete KYC",
    description:
      "Complete our Know Your Client identity and entity verification process. This includes document submission, beneficial ownership disclosure, and source-of-funds certification as required by applicable regulations.",
    details: [
      "Submit required identity documents",
      "Complete entity verification",
      "Pass AML/KYC screening",
    ],
    cta: "Learn About KYC",
    href: "/contact",
  },
  {
    step: "04",
    icon: LayoutDashboard,
    title: "Access Platform",
    description:
      "Upon successful verification, you gain full access to the GEM Enterprise platform — including your client dashboard, assigned advisor, security operations visibility, and all contracted service modules.",
    details: [
      "Access client portal and dashboard",
      "Connect with your assigned advisor",
      "Begin active service engagements",
    ],
    cta: "Sign In",
    href: "/client-login",
  },
];

const eligibilityCategories = [
  {
    icon: UserCheck,
    title: "Accredited Investors",
    description:
      "Individual investors who meet applicable net worth or income thresholds under SEC Regulation D or equivalent standards in their jurisdiction of residence.",
    requirements: ["Net worth or income qualification", "Identity verification", "US or international accepted jurisdictions"],
  },
  {
    icon: Building2,
    title: "Enterprises & Corporations",
    description:
      "Registered business entities seeking institutional-grade security operations, compliance advisory, or financial security services. Includes publicly traded and private companies.",
    requirements: ["Active business registration", "Authorized signatory", "Organizational documentation"],
  },
  {
    icon: Briefcase,
    title: "Family Offices",
    description:
      "Single and multi-family offices with managed assets requiring comprehensive security, financial protection, and operational risk management across complex portfolio structures.",
    requirements: ["Family office attestation", "AUM documentation", "Beneficial ownership disclosure"],
  },
  {
    icon: Users,
    title: "Institutional Clients",
    description:
      "Regulated financial institutions, investment advisors, fund managers, endowments, and other entities requiring enterprise security and compliance support at institutional scale.",
    requirements: ["Regulatory registration", "Institutional authorization letter", "Compliance officer contact"],
  },
];

const faqs = [
  {
    question: "How long does the onboarding process take?",
    answer:
      "Typical onboarding — from initial eligibility confirmation through KYC completion and platform access — takes between 5 and 10 business days for individual applicants, and 10 to 20 business days for institutional entities. Timeline depends on the completeness and quality of submitted documentation.",
  },
  {
    question: "Is there a fee to apply or go through onboarding?",
    answer:
      "There is no fee to apply for or complete the GEM Enterprise onboarding process. Service fees apply only upon execution of a service agreement following successful verification. All fee structures are disclosed in full before any agreement is signed.",
  },
  {
    question: "What jurisdictions does GEM Enterprise currently accept clients from?",
    answer:
      "GEM Enterprise accepts clients from the United States, Canada, the United Kingdom, the European Union, and select additional jurisdictions based on regulatory compatibility. Applicants from restricted or sanctioned jurisdictions will not be accepted. Contact us for jurisdiction-specific guidance.",
  },
  {
    question: "What happens if my eligibility application is not approved?",
    answer:
      "If your application does not meet current eligibility criteria, you will be notified via email with a general explanation. Eligibility decisions may be revisited if your circumstances change — for example, if you subsequently qualify under a different entity category or meet revised threshold requirements. We are unable to provide detailed explanations of eligibility determinations for compliance reasons.",
  },
];

export default function GetStartedPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
            Client Onboarding
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Begin Your{" "}
            <span className="text-gradient-primary">GEM Enterprise Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            GEM Enterprise serves a carefully selected roster of qualified clients. Our structured
            onboarding process ensures every client receives the depth of service and security they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/eligibility">
              <Button size="lg" className="gap-2 glow-cyan">
                Check Eligibility <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/client-login">
              <Button size="lg" variant="outline" className="gap-2">
                <LogIn className="h-4 w-4" />
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
              Onboarding Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Four Steps to Full Platform Access
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our onboarding workflow is designed to be thorough, secure, and as efficient as possible.
              Each step has a clear purpose and defined timeline.
            </p>
          </div>
          <Separator className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onboardingSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.step} className="glass-panel bento-card border-border/50">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-4xl font-bold text-primary/20 leading-none">
                        {step.step}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                        </div>
                        <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {step.step === "01" && (
                      <Link href={step.href}>
                        <Button size="sm" variant="outline" className="gap-2 text-xs">
                          {step.cta} <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility Overview */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
              Who Can Apply
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Eligibility Overview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              GEM Enterprise is open to four categories of qualified applicants. Select the category
              that best describes you or your organization to understand the applicable requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eligibilityCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="glass-panel bento-card border-border/50">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="mt-1 leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-3">
                      Key Requirements
                    </p>
                    <ul className="space-y-2">
                      {category.requirements.map((req) => (
                        <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3 text-primary flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/eligibility">
              <Button size="lg" className="gap-2">
                View Full Eligibility Requirements <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Primary CTAs */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="glass-panel border-primary/30 p-8 text-center bento-card">
              <CardContent className="p-0">
                <div className="p-4 rounded-full bg-primary/10 border border-primary/30 w-fit mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">New Applicant</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Verify that you or your organization meets GEM Enterprise's eligibility criteria
                  before beginning the account creation process.
                </p>
                <Link href="/eligibility">
                  <Button className="gap-2 w-full sm:w-auto glow-cyan">
                    Check Eligibility <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="glass-panel border-border/50 p-8 text-center bento-card">
              <CardContent className="p-0">
                <div className="p-4 rounded-full bg-muted/30 border border-border/50 w-fit mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">Existing Client</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Already completed onboarding? Sign in to your secure client portal to access
                  your dashboard, reports, and advisor communications.
                </p>
                <Link href="/client-login">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    Sign In to Portal <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Common questions about getting started with GEM Enterprise</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="glass-panel border border-border/50 rounded-lg px-5 overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-10">
            <p className="text-muted-foreground text-sm mb-4">
              Have a question not covered here? Our team is ready to help.
            </p>
            <Link href="/contact">
              <Button variant="outline" className="gap-2">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
