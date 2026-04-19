import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };

const contactDetails = [
  {
    icon: Mail,
    label: "General Inquiries",
    value: "contact@gem-enterprise.com",
    type: "email",
  },
  {
    icon: Mail,
    label: "Security Operations",
    value: "security@gem-enterprise.com",
    type: "email",
  },
  {
    icon: Phone,
    label: "Main Office",
    value: "+1 (800) GEM-CORP",
    type: "tel",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "One Enterprise Plaza, Suite 3200\nNew York, NY 10004",
    type: "address",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Monday – Friday\n8:00 AM – 6:00 PM EST",
    type: "hours",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-28 cyber-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/30 bg-primary/10 text-primary font-mono text-xs tracking-widest uppercase">
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Get in{" "}
            <span className="text-gradient-primary">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enterprise inquiries, support, and partnership discussions. Our team responds to all
            qualified inquiries within one business day.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Send a Message</h2>
                <p className="text-muted-foreground text-sm">
                  Complete the form below and a member of our team will follow up promptly.
                  All fields marked with an asterisk are required.
                </p>
              </div>
              <ContactForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="glass-panel border-border/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Contact Information
                  </h3>
                  <div className="space-y-5">
                    {contactDetails.map((detail) => {
                      const Icon = detail.icon;
                      return (
                        <div key={detail.label} className="flex gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 flex-shrink-0 h-fit">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-1">
                              {detail.label}
                            </p>
                            {detail.type === "email" ? (
                              <a
                                href={`mailto:${detail.value}`}
                                className="text-sm text-primary hover:underline font-medium"
                              >
                                {detail.value}
                              </a>
                            ) : detail.type === "tel" ? (
                              <a
                                href={`tel:${detail.value.replace(/[^+\d]/g, "")}`}
                                className="text-sm font-medium hover:text-primary transition-colors"
                              >
                                {detail.value}
                              </a>
                            ) : (
                              <p className="text-sm font-medium whitespace-pre-line">{detail.value}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Emergency Escalation */}
              <Card className="glass-panel border-destructive/30 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-1.5 rounded-md bg-destructive/10 border border-destructive/30 flex-shrink-0">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Emergency Escalation</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Active security incidents only
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    If you are experiencing an active security incident, ransomware attack, data breach,
                    or other critical threat, use the emergency escalation line below. This line is
                    monitored 24/7 by our incident response team.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-1">
                        IR Hotline
                      </p>
                      <a
                        href="tel:+18005551234"
                        className="text-sm font-bold text-destructive hover:underline"
                      >
                        +1 (800) 555-0123
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-1">
                        IR Email
                      </p>
                      <a
                        href="mailto:ir@gem-enterprise.com"
                        className="text-sm font-medium text-destructive hover:underline"
                      >
                        ir@gem-enterprise.com
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-destructive/20">
                    Emergency services are available to active GEM Enterprise clients only. If you are not
                    a client and are experiencing an incident, please call 911 or your national cybercrime
                    reporting authority.
                  </p>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="glass-panel border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-sm mb-3">Expected Response Times</h3>
                  <div className="space-y-3">
                    {[
                      { type: "General Inquiry", time: "1 business day" },
                      { type: "Security Incident (client)", time: "4 hours" },
                      { type: "Partnership Inquiry", time: "2 business days" },
                      { type: "Support Request", time: "Same business day" },
                    ].map((item) => (
                      <div key={item.type} className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{item.type}</span>
                        <span className="text-xs font-mono font-medium text-primary">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
