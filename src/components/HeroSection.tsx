import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Platform Badge */}
          <div className="inline-flex items-center gap-2 glass-panel px-5 py-2.5 rounded-full border border-primary/20 mb-10">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
              GEM Enterprise Platform — 2026
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
            <span className="text-gradient-primary block">Defend.</span>
            <span className="text-foreground block">Protect.</span>
            <span className="text-foreground block">Prevail.</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            GEM Enterprise delivers institutional-grade cybersecurity, financial security, and real estate protection for qualified clients. Threat intelligence. Asset recovery. Compliance. All from a single command platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button variant="hero" size="lg" asChild className="w-full sm:w-auto min-w-[200px]">
              <Link to="/register" className="flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto min-w-[200px] border-primary/30 text-primary hover:bg-primary/10">
              <Link to="/intel" className="flex items-center justify-center gap-2">
                View Intel
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
