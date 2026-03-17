import { Shield, Lock, FileCheck, Clock, Server, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustPillars = [
  {
    icon: Shield,
    title: "Security Practices",
    description: "Defense-in-depth architecture with multiple layers of protection",
  },
  {
    icon: Lock,
    title: "Data Encryption",
    description: "AES-256 encryption at rest, TLS 1.3 in transit",
  },
  {
    icon: FileCheck,
    title: "Compliance",
    description: "SOC 2 Type II, ISO 27001, GDPR, HIPAA compliant",
  },
  {
    icon: Clock,
    title: "Availability",
    description: "99.99% uptime SLA with redundant global infrastructure",
  },
  {
    icon: Server,
    title: "Infrastructure",
    description: "Isolated environments with continuous security monitoring",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Regular security audits and public disclosure policies",
  },
];

export const TrustSection = () => {
  return (
    <section id="trust" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                <span>Trust Center</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Security is Our <span className="text-gradient-primary">Foundation</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                We practice what we preach. Explore how we protect your data and maintain the highest security standards.
              </p>
            </div>
            <Button variant="glass" size="lg">
              View Full Trust Center
            </Button>
          </div>

          {/* Trust Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustPillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="group glass-panel rounded-xl p-6 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                    <pillar.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications Bar */}
          <div className="mt-16 glass-panel rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Enterprise-Grade Certifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Independently audited and verified security controls
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                {["SOC 2", "ISO 27001", "GDPR", "HIPAA", "PCI DSS"].map((cert) => (
                  <div
                    key={cert}
                    className="px-4 py-2 rounded-lg bg-secondary/50 text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                  >
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
