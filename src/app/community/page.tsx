import Link from "next/link";
import { Users, FileText, Globe, ArrowRight, Calendar, MapPin, Mail, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Community" };

const membershipBenefits = [
  "Priority access to GEM intelligence briefings and threat advisories",
  "Exclusive quarterly executive roundtables with GEM analysts",
  "Early access to new platform features and research publications",
  "Dedicated account manager and named incident response liaison",
  "Member-only secure communication channel for peer collaboration",
  "Discounted rates on advisory engagements and training programs",
  "Invitations to GEM's annual Enterprise Security Summit",
];

const newsletters = [
  {
    title: "The GEM Threat Wire",
    frequency: "Weekly",
    description:
      "A concise weekly digest of the top cybersecurity developments, emerging threat actors, and actionable defensive recommendations for enterprise security teams.",
    tag: "Cybersecurity",
  },
  {
    title: "Financial Security Monitor",
    frequency: "Monthly",
    description:
      "Monthly analysis of financial crime trends, regulatory developments, and asset protection strategies — written for CFOs, compliance officers, and institutional investors.",
    tag: "Financial",
  },
  {
    title: "Real Estate Intelligence Brief",
    frequency: "Monthly",
    description:
      "Property fraud trends, title crime developments, and market-level security intelligence for real estate executives and portfolio managers.",
    tag: "Real Estate",
  },
];

const events = [
  {
    date: "2026-04-08",
    title: "Enterprise Threat Landscape Webinar — Q2 2026",
    type: "Virtual",
    description: "GEM's senior analysts present an in-depth review of emerging threats targeting enterprise environments in Q2 2026.",
  },
  {
    date: "2026-04-22",
    title: "Financial Crime & Cyber Risk Summit",
    type: "In-Person",
    location: "New York, NY",
    description: "Half-day summit bringing together CISOs, CFOs, and risk executives to discuss the intersection of cyber and financial crime.",
  },
  {
    date: "2026-05-14",
    title: "Real Estate Fraud Prevention Workshop",
    type: "Virtual",
    description: "Interactive workshop covering title fraud detection, deed monitoring best practices, and legal remediation pathways.",
  },
  {
    date: "2026-06-03",
    title: "GEM Annual Enterprise Security Summit",
    type: "In-Person",
    location: "Washington, D.C.",
    description: "GEM's flagship annual event — two days of keynotes, roundtables, and hands-on technical sessions with enterprise security leaders.",
  },
];

const testimonials = [
  {
    quote:
      "GEM's threat intelligence platform has materially changed how our security team operates. The quality of their briefings and the speed of their response during our Q3 incident was exceptional. We recovered 100% of compromised assets.",
    name: "Margaret L. Harrington",
    title: "Chief Information Security Officer",
    company: "Meridian Capital Group",
  },
  {
    quote:
      "After a targeted real estate fraud attempt against our commercial portfolio, GEM's team intervened within hours. The forensic work they provided was instrumental in the successful prosecution. I would not operate without them.",
    name: "David Chen",
    title: "Managing Director, Portfolio Risk",
    company: "Apex Financial Holdings",
  },
  {
    quote:
      "The GEM community has become an invaluable peer network. The executive roundtables alone are worth the membership — direct access to GEM's analysts alongside peers facing the same challenges is a rare thing in this industry.",
    name: "Priya Nambiar",
    title: "VP of Enterprise Risk",
    company: "Northstar Realty Trust",
  },
];

const partners = [
  "Meridian Capital Group",
  "Apex Financial Holdings",
  "Northstar Realty Trust",
  "Vanguard Infrastructure Partners",
  "Crestview Legal Partners",
  "Sovereign Risk Advisors",
];

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section
        id="hero"
        className="relative py-28 cyber-grid overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background pointer-events-none" />
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary glow-cyan">
              <Users className="h-12 w-12" />
            </div>
          </div>
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase px-4 py-1.5">
            Enterprise Network
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
            The GEM Enterprise{" "}
            <span className="text-gradient-primary">Community</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A private network of enterprise security leaders, financial executives, and real estate professionals — connected through GEM's intelligence platform and shared commitment to security excellence.
          </p>
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="py-24 container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Membership <span className="text-gradient-primary">Benefits</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              GEM Community membership is extended by invitation or application to qualified enterprise clients. Members gain exclusive access to intelligence, events, and a curated professional network.
            </p>
            <ul className="space-y-3">
              {membershipBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="glass-panel border-border/50 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Apply for Membership</CardTitle>
              <p className="text-muted-foreground text-sm">
                Membership is subject to review and approval. Applications are assessed within 5 business days.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="text-foreground font-medium">Eligibility:</span> Enterprise organizations with 100+ employees or $50M+ in annual revenue.</p>
                <p><span className="text-foreground font-medium">Process:</span> Submit application, complete KYC verification, attend onboarding briefing.</p>
                <p><span className="text-foreground font-medium">Timeline:</span> Approved members gain platform access within 48 hours of verification.</p>
              </div>
              <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold">
                <Link href="/get-started">
                  Apply for Membership <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Already a member?{" "}
                <Link href="/client-login" className="text-primary hover:underline">
                  Sign in to the Hub
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletters */}
      <section id="newsletters" className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Intelligence <span className="text-gradient-primary">Newsletters</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Stay informed with GEM's curated publications — delivered directly to your inbox on a consistent schedule.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {newsletters.map((nl) => (
              <Card key={nl.title} className="glass-panel bento-card border-border/50 flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">{nl.tag}</Badge>
                    <Badge className="bg-muted text-muted-foreground border-border text-xs">{nl.frequency}</Badge>
                  </div>
                  <CardTitle className="text-base font-semibold">{nl.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{nl.description}</p>
                  <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 w-full">
                    <Mail className="mr-2 h-3.5 w-3.5" /> Subscribe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="py-24 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Upcoming <span className="text-gradient-primary">Events</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            GEM hosts exclusive virtual and in-person events for enterprise security and finance professionals throughout the year.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {events.map((event, i) => (
            <Card key={i} className="glass-panel bento-card border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={`text-xs ${
                        event.type === "Virtual"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {event.type}
                    </Badge>
                    {event.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 font-mono">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                  </div>
                </div>
                <CardTitle className="text-sm font-semibold leading-snug">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-xs leading-relaxed">{event.description}</p>
                <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 text-xs">
                  Register Interest
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Client <span className="text-gradient-primary">Testimonials</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Hear from enterprise leaders who have experienced the GEM difference firsthand.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="glass-panel bento-card border-border/50 flex flex-col">
                <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-6">
                  <blockquote className="text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                    <p className="text-xs text-primary font-mono">{t.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-mono mb-8">
            Community Partners &amp; Members
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((name) => (
              <div
                key={name}
                className="glass-panel px-5 py-2.5 rounded-full text-sm font-medium text-muted-foreground border-border/50 hover:text-foreground transition-colors"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section id="cta" className="py-24 bg-card/40 border-t border-border">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Join the GEM{" "}
            <span className="text-gradient-primary">Community</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Connect with enterprise security leaders, access exclusive intelligence, and strengthen your organization's security posture with the GEM network behind you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8">
              <Link href="/get-started">
                Apply for Membership <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-semibold px-8">
              <Link href="/client-login">Client Login</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
