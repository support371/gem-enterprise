import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { GemAssist } from "@/components/GemAssist";
import { ServiceTierComparison } from "@/components/ServiceTierComparison";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
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
                <span>Pricing</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Security That Scales <span className="text-gradient-primary">With Your Business</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transparent, flexible pricing for enterprise-grade cybersecurity. Choose the tier that fits your security requirements.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Service Tier Comparison */}
        <ServiceTierComparison />

        {/* FAQ */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {[
                  {
                    q: "How is pricing determined?",
                    a: "Pricing is customized based on your organization's size, industry, compliance requirements, and security needs. Contact us for a detailed quote.",
                  },
                  {
                    q: "Can I switch tiers later?",
                    a: "Yes, you can upgrade or adjust your service tier at any time. Our team will work with you to ensure a smooth transition.",
                  },
                  {
                    q: "What's included in the SLA?",
                    a: "Each tier includes 24/7 monitoring, guaranteed response times, and uptime commitments. Enterprise tier includes dedicated account management and priority support.",
                  },
                  {
                    q: "Do you offer custom solutions?",
                    a: "Absolutely. For organizations with unique requirements, we offer fully customized security solutions beyond our standard tiers.",
                  },
                ].map((faq, i) => (
                  <div key={i} className="glass-panel rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground ml-7">{faq.a}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8">
                Let's discuss your security needs and find the perfect plan for your organization.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/contact">
                    Request Quote
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <Link to="/solutions">View Solutions</Link>
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

export default Pricing;
