import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Users, Shield, DollarSign } from "lucide-react";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: React.ElementType;
  growth?: string;
}

const stats: StatItem[] = [
  { 
    value: 99, 
    suffix: "%", 
    label: "Uptime", 
    description: "Enterprise Reliability",
    icon: Shield,
    growth: "+23%"
  },
  { 
    value: 500, 
    suffix: "+", 
    label: "Enterprise Clients", 
    description: "Fortune 500 companies trust our security solutions",
    icon: Users,
    growth: "+15%"
  },
  { 
    value: 2.4, 
    suffix: "M+", 
    label: "Threats Blocked", 
    description: "Real-time threat detection and mitigation",
    icon: Shield,
    growth: "+41%"
  },
  { 
    value: 50, 
    suffix: "M+", 
    label: "Assets Protected", 
    description: "Total value of client assets under protection",
    icon: DollarSign,
    growth: "+41%"
  },
];

export const StatsSection = () => {
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView || hasAnimated) return;
    
    setHasAnimated(true);
    
    const timers = stats.map((stat, index) => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      
      return setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
        }
        setAnimatedStats(prev => {
          const newStats = [...prev];
          newStats[index] = current;
          return newStats;
        });
      }, duration / steps);
    });

    return () => timers.forEach(t => clearInterval(t));
  }, [isInView, hasAnimated]);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Uptime Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="glass-panel rounded-2xl p-8 md:p-12 text-center border border-primary/20 glow-cyan">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-6xl md:text-8xl font-bold text-gradient-primary">
                {animatedStats[0].toFixed(0)}
              </span>
              <span className="text-4xl md:text-5xl font-bold text-primary">%</span>
              <span className="text-xl text-muted-foreground ml-2">Uptime</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Enterprise Reliability
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Industry-leading uptime with 24/7 monitoring and instant failover protection
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-success" />
                99.9% SLA Guarantee
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Redundant Infrastructure
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.slice(1).map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = stat.suffix === "M+" 
              ? animatedStats[index + 1].toFixed(1)
              : Math.round(animatedStats[index + 1]);
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  {stat.growth && (
                    <div className="flex items-center gap-1 text-success text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {stat.growth}
                    </div>
                  )}
                </div>
                
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    {displayValue}
                  </span>
                  <span className="text-xl text-primary font-bold">{stat.suffix}</span>
                </div>
                
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
