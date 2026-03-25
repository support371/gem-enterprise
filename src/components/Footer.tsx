import { useState } from "react";
import { Shield, Phone, Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const footerLinks = {
  Solutions: [
    { label: "Threat Detection", href: "/solutions/threat-monitoring" },
    { label: "SOC Services", href: "/solutions/soc-services" },
    { label: "Asset Recovery", href: "/solutions/asset-recovery" },
    { label: "Cloud Security", href: "/solutions/cloud-security" },
  ],
  Company: [
    { label: "About Us", href: "/trust-center" },
    { label: "Leadership", href: "/resources" },
    { label: "Careers", href: "/resources" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Case Studies", href: "/resources" },
    { label: "Documentation", href: "/resources" },
    { label: "API", href: "/resources" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/trust-center" },
    { label: "Terms of Service", href: "/trust-center" },
    { label: "Security", href: "/trust-center" },
    { label: "Compliance", href: "/trust-center" },
  ],
};

const supportTeams = [
  { name: "Security Team", status: "Online" },
  { name: "Real Estate", status: "Online" },
  { name: "Technical Support", status: "Online" },
];

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const { error } = await supabase.functions.invoke("mailchimp-subscribe", {
        body: { email },
      });
      setStatus(error ? "error" : "success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>You're subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xs">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 text-sm"
        required
      />
      <Button type="submit" size="sm" variant="hero" disabled={status === "loading"} className="shrink-0">
        {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
      </Button>
    </form>
  );
}

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 pt-16 pb-8 relative">
      {/* Live Support Status Bar */}
      <div className="container mx-auto px-4 mb-12">
        <div className="glass-panel rounded-2xl p-6 border border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {supportTeams.map((team) => (
                <div key={team.name} className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  <span className="text-muted-foreground">{team.name}:</span>
                  <span className="text-success font-medium">{team.status}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Average response time: <span className="text-foreground font-medium">2 minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-gradient-primary">GEM</span>
                <span className="text-foreground/80 ml-1">Enterprise</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Enterprise cyber defense and digital trust engineering for high-risk environments.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="tel:+1-555-GEM-SECURE" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" />
                +1-555-GEM-SECURE
              </a>
              <a href="mailto:contact@gemcybersecurity.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                contact@gemcybersecurity.com
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span>All Systems Operational</span>
            </div>

            <div>
              <p className="text-xs font-medium text-foreground mb-2">Security briefings, straight to you</p>
              <NewsletterSignup />
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4 text-sm">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Badges Row */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs text-muted-foreground">Trusted by:</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-foreground font-medium">500+ Enterprise Clients</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Federal Compliant</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">2-Minute Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GEM Enterprise Security. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["SOC 2", "ISO 27001", "GDPR", "HIPAA", "PCI DSS"].map((cert) => (
              <span
                key={cert}
                className="text-xs font-mono text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
