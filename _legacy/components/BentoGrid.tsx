import { Shield, Lock, Eye, Cpu, Network, AlertTriangle, FileSearch, Users, Play, Image, ArrowRight, Bot, Building2, Briefcase, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
  accentColor?: "cyan" | "lime" | "plum";
  size?: "sm" | "md" | "lg";
  category?: string;
  categoryType?: "core" | "automation" | "recovery" | "legal";
  hasDemo?: boolean;
  hasVideo?: boolean;
  metrics?: { label: string; value: string }[];
  link?: string;
}

const categoryStyles = {
  core: "bg-primary/10 text-primary border-primary/20",
  automation: "bg-success/10 text-success border-success/20",
  recovery: "bg-accent/20 text-accent-foreground border-accent/20",
  legal: "bg-secondary text-secondary-foreground border-secondary",
};

const BentoCard = ({ 
  title, 
  description, 
  icon: Icon, 
  className, 
  accentColor = "cyan",
  size = "md",
  category,
  categoryType = "core",
  hasDemo,
  hasVideo,
  metrics,
  link = "/solutions"
}: BentoCardProps) => {
  const accentStyles = {
    cyan: "group-hover:text-primary group-hover:shadow-primary/30",
    lime: "group-hover:text-success group-hover:shadow-success/30",
    plum: "group-hover:text-accent group-hover:shadow-accent/30",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative glass-panel rounded-2xl p-6 bento-card cursor-pointer overflow-hidden",
        size === "lg" && "p-8",
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
              categoryStyles[categoryType]
            )}>
              {category}
            </span>
          </div>
        )}

        <div className={cn(
          "w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 transition-all duration-300",
          accentStyles[accentColor]
        )}>
          <Icon className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        <h3 className={cn(
          "font-semibold text-foreground mb-2 transition-colors duration-300",
          size === "lg" ? "text-xl" : "text-lg"
        )}>
          {title}
        </h3>
        
        <p className={cn(
          "text-muted-foreground leading-relaxed flex-1",
          size === "lg" ? "text-base" : "text-sm"
        )}>
          {description}
        </p>

        {/* Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-4">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <span className="text-lg font-bold text-primary">{metric.value}</span>
                  <span className="text-xs text-muted-foreground ml-1">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(hasDemo || hasVideo) && (
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
            {hasDemo && (
              <Button variant="glass" size="sm" className="text-xs">
                <Play className="w-3 h-3 mr-1" />
                Live Dashboard
              </Button>
            )}
            {hasVideo && (
              <Button variant="glass" size="sm" className="text-xs">
                <Image className="w-3 h-3 mr-1" />
                Demo Video
              </Button>
            )}
          </div>
        )}

        {/* Learn More Link */}
        <div className="mt-4 pt-2">
          <Link 
            to={link}
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group/link"
          >
            Explore Security
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

const capabilities = [
  {
    title: "Advanced Threat Monitoring",
    description: "AI-powered 24/7 threat detection with real-time response capabilities. Federal compliance standards with SOC 2 certification.",
    icon: Shield,
    accentColor: "cyan" as const,
    size: "lg" as const,
    className: "md:col-span-2 md:row-span-2",
    category: "Core Security",
    categoryType: "core" as const,
    hasDemo: true,
    hasVideo: true,
    metrics: [
      { label: "Threats Blocked", value: "2.4M+" },
      { label: "Success Rate", value: "99.9%" }
    ],
    link: "/solutions/threat-monitoring"
  },
  {
    title: "Telegram Automation",
    description: "Advanced bot solutions for secure communications and workflow automation.",
    icon: Bot,
    accentColor: "lime" as const,
    category: "Automation",
    categoryType: "automation" as const,
    link: "/solutions/automation"
  },
  {
    title: "Asset Management",
    description: "Professional real estate services through Alliance Trust Realty LLC partnership.",
    icon: Building2,
    accentColor: "plum" as const,
    category: "Real Estate",
    categoryType: "recovery" as const,
    metrics: [
      { label: "Under Management", value: "$50M+" },
      { label: "Recovery Rate", value: "94%" }
    ],
    link: "/solutions/asset-management"
  },
  {
    title: "Asset Recovery",
    description: "Specialized digital asset recovery with forensic analysis and legal support.",
    icon: FileSearch,
    accentColor: "cyan" as const,
    category: "Recovery",
    categoryType: "recovery" as const,
    metrics: [
      { label: "Recovered", value: "$2.3M+" },
      { label: "Success Rate", value: "94%" }
    ],
    link: "/solutions/asset-recovery"
  },
  {
    title: "Legal Services",
    description: "Power of attorney, legal documentation, and trust management services for secure asset protection.",
    icon: Scale,
    accentColor: "plum" as const,
    category: "Legal",
    categoryType: "legal" as const,
    link: "/solutions/legal-services"
  },
  {
    title: "Investment Portfolio",
    description: "Strategic investment management and portfolio optimization with comprehensive risk assessment.",
    icon: Briefcase,
    accentColor: "lime" as const,
    metrics: [
      { label: "YTD Performance", value: "+23.4%" }
    ],
    link: "/solutions/investment-portfolio"
  },
  {
    title: "Security Operations Center",
    description: "24/7 SOC-as-a-Service with dedicated analysts monitoring your infrastructure.",
    icon: Eye,
    accentColor: "cyan" as const,
    link: "/solutions/soc-services"
  },
  {
    title: "Partnership Services",
    description: "Trusted partnerships and trustee services for secure business relationships.",
    icon: Users,
    accentColor: "plum" as const,
    link: "/solutions/partnerships"
  },
];

export const BentoGrid = () => {
  return (
    <section id="solutions" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <span>Core Solutions</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comprehensive Enterprise{" "}
            <span className="text-gradient-primary">Security Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Integrated solutions combining advanced cybersecurity, asset recovery, and real estate services
            with AI-powered automation and federal compliance standards.
          </p>
        </motion.div>

        {/* View All Button */}
        <div className="flex justify-center mb-12">
          <Button variant="glass" size="lg" asChild>
            <Link to="/solutions">
              View All Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {capabilities.map((capability, index) => (
            <BentoCard
              key={capability.title}
              title={capability.title}
              description={capability.description}
              icon={capability.icon}
              accentColor={capability.accentColor}
              size={capability.size}
              className={capability.className}
              category={capability.category}
              categoryType={capability.categoryType}
              hasDemo={capability.hasDemo}
              hasVideo={capability.hasVideo}
              metrics={capability.metrics}
              link={capability.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
