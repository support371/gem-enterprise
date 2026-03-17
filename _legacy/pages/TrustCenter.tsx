import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { 
  Shield, Lock, FileCheck, Clock, Server, Eye, 
  AlertTriangle, Database, Key, Globe, FileText, Users 
} from "lucide-react";

const trustSections = [
  {
    id: "overview",
    icon: Shield,
    title: "Trust Center Overview",
    description: "Security is the foundation of everything we do. Our trust center provides complete transparency into our security practices, certifications, and commitments.",
    content: [
      "Defense-in-depth architecture with multiple security layers",
      "Continuous third-party security assessments",
      "Dedicated security team with 24/7 monitoring",
      "Regular penetration testing and vulnerability assessments",
    ],
  },
  {
    id: "practices",
    icon: Users,
    title: "Security Practices",
    description: "Our security practices follow industry best standards and are continuously improved based on emerging threats.",
    content: [
      "Least privilege access control model",
      "Multi-factor authentication required for all systems",
      "Role-based access control (RBAC) enforcement",
      "Regular access reviews and certification",
      "Privileged access management (PAM) for sensitive systems",
    ],
  },
  {
    id: "logging",
    icon: Eye,
    title: "Logging & Monitoring",
    description: "Comprehensive visibility into all system activities with real-time alerting and incident response capabilities.",
    content: [
      "Centralized log aggregation and analysis",
      "Real-time security event monitoring",
      "Automated threat detection and alerting",
      "Incident response playbooks with defined SLAs",
      "Security information and event management (SIEM)",
    ],
  },
  {
    id: "encryption",
    icon: Key,
    title: "Encryption Standards",
    description: "Industry-leading encryption protects your data at rest and in transit.",
    content: [
      "AES-256 encryption for data at rest",
      "TLS 1.3 for all data in transit",
      "Hardware security modules (HSM) for key management",
      "Regular cryptographic key rotation",
      "End-to-end encryption for sensitive communications",
    ],
  },
  {
    id: "privacy",
    icon: Database,
    title: "Privacy & Data Handling",
    description: "Your data is handled with the utmost care and in compliance with global privacy regulations.",
    content: [
      "Data minimization principles",
      "Clear data retention policies",
      "No third-party data sharing without consent",
      "Right to access, correct, and delete data",
      "Privacy impact assessments for new features",
    ],
  },
  {
    id: "disclosure",
    icon: AlertTriangle,
    title: "Responsible Disclosure",
    description: "We welcome security researchers and maintain a transparent vulnerability disclosure program.",
    content: [
      "Security contact: security@gemcybersecurity.com",
      "Acknowledgment within 24 hours",
      "Good-faith investigation of all reports",
      "No legal action against good-faith researchers",
      "Public disclosure after remediation",
    ],
  },
  {
    id: "availability",
    icon: Globe,
    title: "Availability & Resilience",
    description: "Our infrastructure is designed for maximum availability and rapid recovery.",
    content: [
      "99.99% uptime SLA commitment",
      "Multi-region redundant infrastructure",
      "Automated failover and disaster recovery",
      "Regular backup testing and validation",
      "Documented business continuity plans",
    ],
  },
];

const certifications = [
  { name: "SOC 2 Type II", description: "Service Organization Control audit" },
  { name: "ISO 27001", description: "Information security management" },
  { name: "GDPR", description: "EU data protection compliance" },
  { name: "HIPAA", description: "Healthcare data security" },
  { name: "PCI DSS", description: "Payment card data security" },
];

const TrustCenter = () => {
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
                <span>Trust Center</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Security is Our <span className="text-gradient-primary">Foundation</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete transparency into how we protect your data, maintain compliance, 
                and ensure the highest security standards for enterprise environments.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Certifications Bar */}
        <section className="py-8 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-default"
                >
                  <FileCheck className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-mono text-sm font-medium text-foreground">{cert.name}</span>
                    <p className="text-xs text-muted-foreground">{cert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Sections */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-16">
              {trustSections.map((section, index) => (
                <AnimatedSection key={section.id} delay={index * 0.1}>
                  <div 
                    id={section.id}
                    className="glass-panel rounded-2xl p-8 md:p-10 scroll-mt-24"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Icon & Title */}
                      <div className="md:w-1/3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <section.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          {section.title}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {section.description}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="md:w-2/3">
                        <ul className="space-y-3">
                          {section.content.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <span className="text-foreground/90">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Questions About Our Security?</h2>
              <p className="text-muted-foreground mb-6">
                Our security team is available to discuss our practices and answer your questions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:security@gemcybersecurity.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Contact Security Team
                </a>
                <a
                  href="#disclosure"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report a Vulnerability
                </a>
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

export default TrustCenter;
