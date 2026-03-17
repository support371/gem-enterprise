import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ServiceTierComparison } from "@/components/ServiceTierComparison";
import { Button } from "@/components/ui/button";
import { 
  Shield, Radar, Lock, Building2, 
  ArrowRight, CheckCircle2, Users, Clock 
} from "lucide-react";
import { Link } from "react-router-dom";

const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary/20",
  accent: "bg-accent/10 text-accent-foreground group-hover:bg-accent/20",
};

const solutions = [
  {
    id: "cyber-defense",
    icon: Shield,
    title: "Cyber Defense & Monitoring",
    shortDesc: "Continuous protection for enterprise environments",
    slug: "cyber-defense",
    color: "primary",
  },
  {
    id: "threat-detection",
    icon: Radar,
    title: "Threat Detection & Response",
    shortDesc: "Proactive threat hunting and incident readiness",
    slug: "threat-detection",
    color: "accent",
  },
  {
    id: "digital-asset",
    icon: Lock,
    title: "Digital Asset Protection",
    shortDesc: "Security advisory for critical digital infrastructure",
    slug: "digital-asset-protection",
    color: "primary",
  },
  {
    id: "trust-security",
    icon: Building2,
    title: "Trust & Real-Asset Security",
    shortDesc: "Partner-backed enterprise security solutions",
    slug: "trust-security",
    color: "accent",
  },
];

const Solutions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 relative">
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                <span>Solutions</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Enterprise-Grade <span className="text-gradient-primary">Security Solutions</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive cybersecurity solutions designed for high-risk environments. 
                From continuous monitoring to incident response, we protect what matters.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
              {solutions.map((solution, index) => (
                <AnimatedSection key={solution.id} delay={index * 0.1}>
                  <Link
                    to={`/solutions/${solution.slug}`}
                    className="group block glass-panel rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 bento-card"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${colorMap[solution.color]}`}>
                        <solution.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {solution.title}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {solution.shortDesc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Why GEM */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-5xl mx-auto">
              <div className="glass-panel rounded-2xl p-8 md:p-12">
                <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Why Choose GEM Cybersecurity?
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    We combine deep expertise with cutting-edge technology to deliver 
                    security solutions that scale with your business.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: Clock, label: "< 15 min", desc: "Response Time" },
                    { icon: Shield, label: "99.99%", desc: "Uptime SLA" },
                    { icon: Users, label: "24/7", desc: "SOC Coverage" },
                    { icon: CheckCircle2, label: "SOC 2", desc: "Certified" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={desc} className="text-center p-4">
                      <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-2xl font-bold text-foreground">{label}</div>
                      <div className="text-sm text-muted-foreground">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Service Tier Comparison */}
        <ServiceTierComparison />

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Strengthen Your Security?
              </h2>
              <p className="text-muted-foreground mb-8">
                Talk to our security experts about your specific needs and challenges.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="hero" size="lg">
                  Schedule Assessment
                </Button>
                <Button variant="glass" size="lg">
                  Talk to Gem-Assist
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
      <GemAssist />
    </div>
  );
};

export default Solutions;
