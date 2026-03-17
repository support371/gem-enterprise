import { motion } from "framer-motion";
import { Quote, Building2, Shield, Heart, Star } from "lucide-react";

// Import client headshots
import michaelReynoldsImg from "@/assets/testimonials/michael-reynolds.jpg";
import jenniferWalshImg from "@/assets/testimonials/jennifer-walsh.jpg";
import davidChenImg from "@/assets/testimonials/david-chen.jpg";
import emilyRodriguezImg from "@/assets/testimonials/emily-rodriguez.jpg";
import sarahChenImg from "@/assets/testimonials/sarah-chen.jpg";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  companyType: string;
  avatar: string;
  metrics?: { label: string; value: string }[];
  featured?: boolean;
}

// Company logos as styled text/icons for enterprise look
const companyLogos: Record<string, { abbr: string; color: string }> = {
  "Fortune 100 Financial Institution": { abbr: "F100", color: "primary" },
  "Global Manufacturing Corp": { abbr: "GMC", color: "accent" },
  "Healthcare Network": { abbr: "HN", color: "success" },
  "TechCorp": { abbr: "TC", color: "primary" },
  "SecureTech": { abbr: "ST", color: "accent" },
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "GEM Enterprise's threat detection capabilities are unmatched. We've seen a 94% reduction in security incidents since implementation. Their 24/7 monitoring gives us peace of mind knowing our $50B+ in assets are protected.",
    author: "Michael Reynolds",
    role: "Chief Information Security Officer",
    company: "Fortune 100 Financial Institution",
    companyType: "Financial",
    avatar: michaelReynoldsImg,
    metrics: [
      { label: "Incident Reduction", value: "94%" },
      { label: "Assets Protected", value: "$50B+" },
      { label: "Response Time", value: "2 min" }
    ],
    featured: true
  },
  {
    id: 2,
    quote: "The real estate asset recovery service helped us reclaim $2.3M in misappropriated funds. Professional, efficient, and results-driven.",
    author: "Jennifer Walsh",
    role: "IT Security Director",
    company: "Global Manufacturing Corp",
    companyType: "Manufacturing",
    avatar: jenniferWalshImg,
    metrics: [
      { label: "Recovered", value: "$2.3M" }
    ]
  },
  {
    id: 3,
    quote: "HIPAA compliance made simple. Their automation solutions reduced our manual compliance work by 78% while maintaining perfect audit scores.",
    author: "Dr. David Chen",
    role: "Chief Technology Officer",
    company: "Healthcare Network",
    companyType: "Healthcare",
    avatar: davidChenImg,
    metrics: [
      { label: "Compliance Rate", value: "100%" }
    ]
  },
  {
    id: 4,
    quote: "GEM Enterprise delivered exceptional results for our digital transformation project. Their expertise is unmatched in the industry.",
    author: "Emily Rodriguez",
    role: "VP of Engineering",
    company: "TechCorp",
    companyType: "Technology",
    avatar: emilyRodriguezImg
  },
  {
    id: 5,
    quote: "Their cybersecurity solutions transformed our security posture completely. Outstanding expertise and 24/7 support.",
    author: "Sarah Chen",
    role: "CISO",
    company: "SecureTech",
    companyType: "Security",
    avatar: sarahChenImg
  }
];

const companyIcons = {
  Financial: Building2,
  Manufacturing: Building2,
  Healthcare: Heart,
  Technology: Shield,
  Security: Shield
};

export const TestimonialsSection = () => {
  const featured = testimonials.find(t => t.featured);
  const others = testimonials.filter(t => !t.featured).slice(0, 4);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <span>Client Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted by <span className="text-gradient-primary">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how enterprises worldwide leverage our security platform to protect their most valuable assets
          </p>
        </motion.div>

        {/* Featured Testimonial */}
        {featured && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="glass-panel rounded-2xl p-8 md:p-10 border border-primary/20 relative overflow-hidden">
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/10" />
              
              {/* Company Logo & Author with Photo */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  {/* Client Photo */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full ring-2 ring-primary/20 overflow-hidden">
                      <img 
                        src={featured.avatar} 
                        alt={featured.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                      <Star className="w-3 h-3 text-success-foreground fill-current" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{featured.author}</h4>
                    <p className="text-sm text-muted-foreground">{featured.role}</p>
                    <p className="text-sm text-primary font-medium">{featured.company}</p>
                  </div>
                </div>
                
                {/* Company Logo Badge */}
                <div className="hidden sm:flex items-center gap-2 glass-panel rounded-lg px-4 py-2 border border-border/50">
                  <div className={`w-10 h-10 rounded-lg bg-${companyLogos[featured.company]?.color || 'primary'}/10 flex items-center justify-center`}>
                    <span className={`text-sm font-bold text-${companyLogos[featured.company]?.color || 'primary'}`}>
                      {companyLogos[featured.company]?.abbr || 'CO'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Verified</p>
                    <p className="text-xs font-semibold text-foreground">Enterprise Client</p>
                  </div>
                </div>
              </div>

              <blockquote className="text-lg md:text-xl text-foreground/90 mb-8 leading-relaxed italic">
                "{featured.quote}"
              </blockquote>

              {/* Metrics */}
              {featured.metrics && (
                <div className="flex flex-wrap gap-6 pt-6 border-t border-border/50">
                  {featured.metrics.map((metric) => (
                    <div key={metric.label} className="text-center">
                      <span className="text-2xl font-bold text-primary">{metric.value}</span>
                      <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Other Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {others.map((testimonial, index) => {
            const Icon = companyIcons[testimonial.companyType as keyof typeof companyIcons] || Building2;
            const logoInfo = companyLogos[testimonial.company];
            
            return (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all group"
              >
                {/* Header with Photo and Company Logo */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {/* Client Photo */}
                    <div className="w-12 h-12 rounded-full ring-2 ring-border group-hover:ring-primary/30 transition-colors overflow-hidden">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{testimonial.author}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  {/* Company Logo Badge */}
                  <div className={`w-10 h-10 rounded-lg bg-${logoInfo?.color || 'secondary'}/10 flex items-center justify-center shrink-0`}>
                    <span className={`text-xs font-bold text-${logoInfo?.color || 'muted-foreground'}`}>
                      {logoInfo?.abbr || <Icon className="w-5 h-5" />}
                    </span>
                  </div>
                </div>

                {/* Company Name */}
                <p className="text-xs text-primary font-medium mb-3">{testimonial.company}</p>

                <blockquote className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                  "{testimonial.quote}"
                </blockquote>

                {testimonial.metrics && testimonial.metrics.length > 0 && (
                  <div className="flex gap-4 pt-4 border-t border-border/50">
                    {testimonial.metrics.map((metric) => (
                      <div key={metric.label}>
                        <span className="text-lg font-bold text-success">{metric.value}</span>
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
