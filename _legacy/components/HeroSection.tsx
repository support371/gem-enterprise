import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, Eye, Zap, CheckCircle2, Clock, Building2, Activity, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import socImage from "@/assets/soc-operations-center.jpg";
import { NetworkParticles } from "@/components/NetworkParticles";

type AudienceType = "ciso" | "it-ops" | "founder";

const audienceContent: Record<AudienceType, { subheadline: string; secondaryCta: string }> = {
  ciso: {
    subheadline: "Advanced cybersecurity monitoring, asset recovery, and real estate services. Powered by AI-driven threat detection and backed by federal compliance standards.",
    secondaryCta: "Schedule Consultation"
  },
  "it-ops": {
    subheadline: "Seamless integration with your existing stack. 24/7 monitoring, automated response, and streamlined incident workflows.",
    secondaryCta: "See Integration Options"
  },
  founder: {
    subheadline: "Enterprise-grade security without the enterprise complexity. Fast onboarding, clear pricing, and expert guidance when you need it.",
    secondaryCta: "Schedule Consultation"
  }
};

const heroStats = [
  { value: 99, suffix: "%", label: "Uptime Guarantee", icon: Activity },
  { value: 2.0, suffix: "min", label: "Response Time", icon: Clock },
  { value: 50, suffix: "M+", label: "Assets Managed", icon: Building2 },
];

const trustBadges = [
  "SOC 2 Certified",
  "Federal Compliant", 
  "24/7 Support"
];

export const HeroSection = () => {
  const [audience, setAudience] = useState<AudienceType>("ciso");
  const [animatedStats, setAnimatedStats] = useState(heroStats.map(() => 0));

  const currentContent = audienceContent[audience];

  useEffect(() => {
    const timers = heroStats.map((stat, index) => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      
      return setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timers[index]);
        }
        setAnimatedStats(prev => {
          const newStats = [...prev];
          newStats[index] = current;
          return newStats;
        });
      }, duration / steps);
    });

    return () => timers.forEach(t => clearInterval(t));
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Network Particle Animation Background */}
      <div className="absolute inset-0">
        <NetworkParticles />
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enterprise Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center lg:justify-start mb-8"
        >
          <div className="inline-flex items-center gap-2 glass-panel px-5 py-2.5 rounded-full border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Enterprise Security Platform</span>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              <span className="text-foreground">Next-Generation</span>
              <br />
              <span className="text-gradient-primary">Security & Trust</span>
              <br />
              <span className="text-foreground">Solutions</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
            >
              {currentContent.subheadline}
            </motion.p>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              {heroStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    className="glass-panel rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-bold text-foreground">
                        {stat.suffix === "%" ? Math.round(animatedStats[index]) : animatedStats[index].toFixed(1)}
                      </span>
                      <span className="text-sm text-primary font-medium">{stat.suffix}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6"
            >
              <Button variant="hero" size="lg" asChild className="group">
                <Link to="/solutions" className="flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  <div className="text-left">
                    <span className="font-semibold">Explore Services</span>
                    <span className="block text-xs opacity-80">Full solution overview</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/contact">
                  {currentContent.secondaryCta}
                </Link>
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              {trustBadges.map((badge, index) => (
                <div key={badge} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">{badge}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: SOC Dashboard Visual */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            {/* Main Dashboard Card */}
            <div className="relative">
              {/* SOC Image with Gradient Border */}
              <div className="relative glass-panel rounded-2xl p-1 glow-cyan overflow-hidden">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                  {/* Actual SOC Image */}
                  <img 
                    src={socImage} 
                    alt="Security Operations Center with multiple monitoring screens displaying real-time cybersecurity dashboards"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />
                  
                  {/* Floating Status Cards */}
                  <div className="absolute top-4 left-4 glass-panel rounded-lg px-3 py-2 flex items-center gap-2 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                    <span className="text-xs font-medium text-foreground">Systems Operational</span>
                  </div>

                  <div className="absolute bottom-4 right-4 glass-panel rounded-lg px-3 py-2 backdrop-blur-md">
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="font-bold text-foreground">1,247</span>
                        <span className="text-muted-foreground ml-1">Threats Blocked</span>
                      </div>
                      <div className="w-px h-4 bg-border" />
                      <div>
                        <span className="font-bold text-foreground">99.9%</span>
                        <span className="text-muted-foreground ml-1">Uptime</span>
                      </div>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute top-4 right-4 glass-panel rounded-full px-3 py-1 flex items-center gap-2 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                    </span>
                    <span className="text-xs font-bold text-destructive">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Floating Metric Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 glass-panel rounded-xl p-4 border border-primary/20 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Threat Detection</p>
                    <p className="text-xs text-success">Active</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute -top-4 -right-4 glass-panel rounded-xl p-4 border border-primary/20 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">24/7 Monitoring</p>
                    <p className="text-xs text-primary">Online</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
};
