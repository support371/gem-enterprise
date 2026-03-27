import { Check, X, Shield, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TierFeature {
  name: string;
  essential: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}

const tiers = [
  {
    name: "Essential",
    icon: Shield,
    description: "Core security monitoring for growing businesses",
    price: "Custom",
    color: "secondary",
    popular: false,
  },
  {
    name: "Professional",
    icon: Zap,
    description: "Advanced protection with proactive threat hunting",
    price: "Custom",
    color: "primary",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Crown,
    description: "Full-spectrum security with dedicated SOC team",
    price: "Custom",
    color: "accent",
    popular: false,
  },
];

const features: TierFeature[] = [
  { name: "24/7 Security Monitoring", essential: true, professional: true, enterprise: true },
  { name: "Threat Detection & Alerts", essential: true, professional: true, enterprise: true },
  { name: "Incident Response", essential: "8hr SLA", professional: "2hr SLA", enterprise: "15min SLA" },
  { name: "Vulnerability Scanning", essential: "Monthly", professional: "Weekly", enterprise: "Continuous" },
  { name: "Compliance Reporting", essential: true, professional: true, enterprise: true },
  { name: "Threat Intelligence Feed", essential: false, professional: true, enterprise: true },
  { name: "Dedicated Account Manager", essential: false, professional: true, enterprise: true },
  { name: "Custom Security Playbooks", essential: false, professional: "5 Playbooks", enterprise: "Unlimited" },
  { name: "Red Team Exercises", essential: false, professional: "Quarterly", enterprise: "Monthly" },
  { name: "Executive Security Briefings", essential: false, professional: false, enterprise: true },
  { name: "On-site SOC Integration", essential: false, professional: false, enterprise: true },
  { name: "Zero-day Protection", essential: false, professional: true, enterprise: true },
  { name: "API Access", essential: false, professional: "Limited", enterprise: "Full Access" },
  { name: "Multi-cloud Coverage", essential: "1 Cloud", professional: "3 Clouds", enterprise: "Unlimited" },
];

const FeatureCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-success mx-auto" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
};

export const ServiceTierComparison = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>Compare Plans</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your <span className="text-gradient-primary">Security Tier</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the protection level that matches your organization's security requirements
          </p>
        </div>

        {/* Tier Cards - Mobile */}
        <div className="lg:hidden space-y-6 mb-8">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`glass-panel rounded-2xl p-6 border animate-fade-in ${
                  tier.popular ? "border-primary" : "border-border/50"
                } relative`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${tier.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${tier.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                </div>
                <Button variant={tier.popular ? "hero" : "glass"} className="w-full" asChild>
                  <Link to="/contact">Request Quote</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block glass-panel rounded-2xl overflow-hidden border border-border/50 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-6 w-1/4">
                    <span className="text-lg font-semibold text-foreground">Features</span>
                  </th>
                  {tiers.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <th key={tier.name} className="p-6 text-center relative">
                        {tier.popular && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-b-lg">
                            Most Popular
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl bg-${tier.color}/10 flex items-center justify-center mx-auto mb-3`}>
                          <Icon className={`w-6 h-6 text-${tier.color}`} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">
                          {tier.description}
                        </p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={`border-b border-border/30 ${
                      index % 2 === 0 ? "bg-secondary/20" : ""
                    } hover:bg-secondary/40 transition-colors`}
                  >
                    <td className="p-4 text-sm font-medium text-foreground">{feature.name}</td>
                    <td className="p-4 text-center">
                      <FeatureCell value={feature.essential} />
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <FeatureCell value={feature.professional} />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="p-6"></td>
                  {tiers.map((tier) => (
                    <td key={tier.name} className="p-6 text-center">
                      <Button 
                        variant={tier.popular ? "hero" : "glass"} 
                        className="min-w-[160px]"
                        asChild
                      >
                        <Link to="/contact">Request Quote</Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Mobile Feature Accordion */}
        <div className="lg:hidden space-y-4">
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className="glass-panel rounded-xl p-4"
            >
              <h4 className="font-medium text-foreground mb-3">{feature.name}</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Essential</p>
                  <FeatureCell value={feature.essential} />
                </div>
                <div className="bg-primary/5 rounded-lg py-2">
                  <p className="text-xs text-muted-foreground mb-1">Professional</p>
                  <FeatureCell value={feature.professional} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Enterprise</p>
                  <FeatureCell value={feature.enterprise} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
