import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Phone, CheckCircle2, Shield, Clock, Headphones, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, label: "Quick Setup" },
  { icon: Headphones, label: "24/7 Support" },
  { icon: Shield, label: "SOC 2 Certified" },
  { icon: Clock, label: "99.9% Uptime" },
];

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel rounded-3xl p-8 md:p-12 lg:p-16 text-center glow-cyan border border-primary/20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to Secure Your{" "}
              <span className="text-gradient-primary">Enterprise</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join 500+ Fortune companies who trust GEM Enterprise for comprehensive
              security, asset protection, and business intelligence solutions.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {feature.label}
                  </div>
                );
              })}
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/register" className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="font-semibold block">Get Started Free</span>
                    <span className="text-xs opacity-80">Create your account in minutes</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild className="group">
                <Link to="/contact" className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="font-semibold block">Talk to Sales</span>
                    <span className="text-xs opacity-80">Free security assessment</span>
                  </div>
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="glass" size="lg" asChild>
                <Link to="/solutions">
                  Watch Demo
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <a href="tel:+14017022460" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
