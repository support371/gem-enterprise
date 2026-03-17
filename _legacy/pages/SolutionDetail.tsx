import { useParams, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { 
  Shield, Radar, Lock, Building2, 
  ArrowRight, CheckCircle2, Users, Zap, Target, 
  FileText, MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const solutionsData = {
  "cyber-defense": {
    icon: Shield,
    title: "Cyber Defense & Monitoring",
    tagline: "Continuous protection for enterprise environments",
    whoFor: [
      "Enterprise organizations with complex IT infrastructure",
      "Companies handling sensitive customer or financial data",
      "Organizations in regulated industries (finance, healthcare, government)",
      "Businesses requiring 24/7 security operations coverage",
    ],
    problem: {
      title: "The Challenge",
      content: "Modern enterprises face an ever-evolving threat landscape. Without continuous monitoring and proactive defense, organizations remain vulnerable to sophisticated attacks that can compromise data, disrupt operations, and damage reputation. Traditional perimeter-based security is no longer sufficient against today's advanced persistent threats.",
    },
    delivers: [
      { icon: Shield, title: "24/7 SOC Operations", desc: "Round-the-clock security operations center monitoring all network activity" },
      { icon: Radar, title: "Threat Intelligence", desc: "Real-time threat intelligence integration for proactive defense" },
      { icon: Target, title: "Vulnerability Management", desc: "Continuous scanning and prioritized remediation guidance" },
      { icon: Zap, title: "Incident Response", desc: "Rapid response protocols with defined SLAs" },
    ],
    process: [
      { step: 1, title: "Assessment", desc: "Comprehensive security posture evaluation" },
      { step: 2, title: "Integration", desc: "Deploy monitoring across your infrastructure" },
      { step: 3, title: "Monitoring", desc: "24/7 SOC coverage begins immediately" },
      { step: 4, title: "Optimization", desc: "Continuous tuning based on findings" },
    ],
    outcomes: [
      "Reduce mean time to detect threats by 80%",
      "Achieve continuous compliance monitoring",
      "Gain complete visibility into security posture",
      "Access expert security analysts on demand",
    ],
    resources: [
      { title: "SOC Operations Guide", type: "Guide" },
      { title: "Threat Landscape Report 2026", type: "Report" },
      { title: "Case Study: Financial Services", type: "Case Study" },
    ],
  },
  "threat-detection": {
    icon: Radar,
    title: "Threat Detection & Response",
    tagline: "Proactive threat hunting and incident readiness",
    whoFor: [
      "Organizations seeking proactive security measures",
      "Companies with existing security teams needing augmentation",
      "Businesses that have experienced security incidents",
      "Enterprises requiring advanced threat hunting capabilities",
    ],
    problem: {
      title: "The Challenge",
      content: "Reactive security measures are no longer enough. Advanced threats often evade traditional detection methods, dwelling in networks for months before discovery. Organizations need proactive threat hunting and the ability to respond rapidly when incidents occur.",
    },
    delivers: [
      { icon: Radar, title: "Threat Hunting", desc: "Proactive searches for hidden threats in your environment" },
      { icon: Target, title: "Behavioral Analysis", desc: "Advanced analytics to detect anomalous activity" },
      { icon: Zap, title: "Rapid Response", desc: "< 15 minute response time for critical incidents" },
      { icon: FileText, title: "Forensic Analysis", desc: "Deep-dive investigations and root cause analysis" },
    ],
    process: [
      { step: 1, title: "Baseline", desc: "Establish normal behavior patterns" },
      { step: 2, title: "Hunt", desc: "Continuous proactive threat hunting" },
      { step: 3, title: "Detect", desc: "Advanced behavioral detection" },
      { step: 4, title: "Respond", desc: "Rapid incident containment and remediation" },
    ],
    outcomes: [
      "Identify threats before they cause damage",
      "Reduce incident response time to minutes",
      "Gain deep forensic insights for prevention",
      "Build organizational incident response capability",
    ],
    resources: [
      { title: "Threat Hunting Methodology", type: "Guide" },
      { title: "Incident Response Playbook", type: "Template" },
      { title: "Case Study: Manufacturing", type: "Case Study" },
    ],
  },
  "digital-asset-protection": {
    icon: Lock,
    title: "Digital Asset Protection",
    tagline: "Security advisory for critical digital infrastructure",
    whoFor: [
      "Organizations with valuable intellectual property",
      "Companies managing digital assets and cryptocurrencies",
      "Businesses with critical SaaS or cloud infrastructure",
      "Enterprises requiring data protection consulting",
    ],
    problem: {
      title: "The Challenge",
      content: "Digital assets—from intellectual property to cryptocurrency holdings—represent significant value and are increasingly targeted by sophisticated attackers. Traditional security approaches may not adequately protect these high-value assets, requiring specialized strategies and controls.",
    },
    delivers: [
      { icon: Lock, title: "Asset Inventory", desc: "Comprehensive mapping of digital assets and risks" },
      { icon: Shield, title: "Protection Strategy", desc: "Tailored security controls for high-value assets" },
      { icon: Users, title: "Access Management", desc: "Privileged access controls and monitoring" },
      { icon: Zap, title: "Recovery Planning", desc: "Business continuity and disaster recovery" },
    ],
    process: [
      { step: 1, title: "Discovery", desc: "Identify and classify digital assets" },
      { step: 2, title: "Risk Assessment", desc: "Evaluate threats and vulnerabilities" },
      { step: 3, title: "Control Design", desc: "Implement protective measures" },
      { step: 4, title: "Monitoring", desc: "Continuous protection and alerting" },
    ],
    outcomes: [
      "Complete visibility into digital asset landscape",
      "Risk-based protection prioritization",
      "Reduced exposure to asset-targeted attacks",
      "Documented recovery procedures for critical assets",
    ],
    resources: [
      { title: "Digital Asset Security Framework", type: "Guide" },
      { title: "Crypto Security Best Practices", type: "Whitepaper" },
      { title: "Case Study: Technology Sector", type: "Case Study" },
    ],
  },
  "trust-security": {
    icon: Building2,
    title: "Trust & Real-Asset Security",
    tagline: "Partner-backed enterprise security solutions",
    whoFor: [
      "Large enterprises with physical and digital convergence needs",
      "Organizations requiring integrated security solutions",
      "Companies with real estate or physical infrastructure",
      "Businesses seeking strategic security partnerships",
    ],
    problem: {
      title: "The Challenge",
      content: "Enterprise security increasingly requires integration between physical and digital domains. Organizations need trusted partners who can deliver comprehensive solutions spanning both worlds, with the expertise and resources to protect complex, multi-faceted environments.",
    },
    delivers: [
      { icon: Building2, title: "Integrated Security", desc: "Unified approach to physical and digital security" },
      { icon: Users, title: "Partner Network", desc: "Access to vetted security solution providers" },
      { icon: Shield, title: "Risk Management", desc: "Enterprise risk assessment and mitigation" },
      { icon: FileText, title: "Compliance Support", desc: "Multi-framework compliance assistance" },
    ],
    process: [
      { step: 1, title: "Strategy", desc: "Develop unified security strategy" },
      { step: 2, title: "Partner Selection", desc: "Match with appropriate solution providers" },
      { step: 3, title: "Implementation", desc: "Coordinated solution deployment" },
      { step: 4, title: "Governance", desc: "Ongoing oversight and optimization" },
    ],
    outcomes: [
      "Unified security posture across domains",
      "Streamlined vendor management",
      "Coordinated incident response",
      "Strategic security roadmap alignment",
    ],
    resources: [
      { title: "Integrated Security Guide", type: "Guide" },
      { title: "Partner Vetting Criteria", type: "Whitepaper" },
      { title: "Case Study: Real Estate", type: "Case Study" },
    ],
  },
};

const SolutionDetail = () => {
  const { slug } = useParams();
  const solution = slug ? solutionsData[slug as keyof typeof solutionsData] : null;

  if (!solution) {
    return <Navigate to="/solutions" replace />;
  }

  const Icon = solution.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 relative">
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="max-w-4xl mx-auto">
              <Link 
                to="/solutions" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Solutions
              </Link>
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                    {solution.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {solution.tagline}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-4xl mx-auto">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Who This Is For
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {solution.whoFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Problem Context */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">{solution.problem.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {solution.problem.content}
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* What GEM Delivers */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-8">What GEM Delivers</h2>
              </AnimatedSection>
              <StaggerContainer className="grid sm:grid-cols-2 gap-6">
                {solution.delivers.map((item) => (
                  <StaggerItem key={item.title}>
                    <div className="glass-panel rounded-xl p-6 h-full">
                      <item.icon className="w-8 h-8 text-primary mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-8">How It Works</h2>
              </AnimatedSection>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {solution.process.map((step, i) => (
                  <AnimatedSection key={step.step} delay={i * 0.1}>
                    <div className="relative">
                      <div className="text-5xl font-bold text-primary/10 absolute -top-4 -left-2">
                        {step.step}
                      </div>
                      <div className="pt-6 pl-4">
                        <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-4xl mx-auto">
              <div className="glass-panel rounded-2xl p-8 border-l-4 border-l-primary">
                <h2 className="text-xl font-bold mb-4">Expected Outcomes</h2>
                <ul className="space-y-3">
                  {solution.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      <span className="text-foreground">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
              </AnimatedSection>
              <div className="grid sm:grid-cols-3 gap-4">
                {solution.resources.map((resource) => (
                  <AnimatedSection key={resource.title}>
                    <Link
                      to="/resources"
                      className="block glass-panel rounded-xl p-5 hover:border-primary/30 transition-all group"
                    >
                      <span className="text-xs text-primary font-medium">{resource.type}</span>
                      <h3 className="font-medium text-foreground mt-1 group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8">
                Schedule a briefing with our security experts to discuss your specific needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="hero" size="lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Request Enterprise Briefing
                </Button>
                <Button variant="glass" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
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

export default SolutionDetail;
