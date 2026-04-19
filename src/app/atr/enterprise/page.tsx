import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Scale,
  Building2,
  CheckCircle,
  ArrowRight,
  Lock,
  Eye,
  Server,
  ClipboardCheck,
  FileSearch,
  Globe,
  Users,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  BarChart3,
  Phone,
} from "lucide-react";

const divisions = [
  {
    icon: <Shield className="w-12 h-12 text-cyan-400" />,
    label: "Division 01",
    name: "GEM Cybersecurity & Monitoring",
    description:
      "Enterprise-grade threat intelligence and 24/7 Security Operations Center services protecting the GEM ecosystem and client infrastructure against advanced persistent threats.",
    capabilities: [
      "24/7 Security Operations Center (SOC)",
      "Threat intelligence & monitoring",
      "Incident response & remediation",
      "Penetration testing & red team exercises",
      "Zero-trust architecture implementation",
      "SIEM & SOAR platform management",
    ],
    link: "/intel",
    linkLabel: "Explore GEM Intel",
    accentColor: "text-cyan-400",
    borderColor: "border-l-cyan-400",
    iconBg: "bg-cyan-900/30",
    reversed: false,
  },
  {
    icon: <Scale className="w-12 h-12 text-violet-400" />,
    label: "Division 02",
    name: "Core Compliance Division",
    description:
      "Comprehensive regulatory compliance, AML/KYC frameworks, and institutional governance programs that keep clients ahead of evolving regulatory requirements across all jurisdictions.",
    capabilities: [
      "AML & KYC onboarding programs",
      "Regulatory compliance audits",
      "Policy & procedure development",
      "FINRA & SEC regulatory support",
      "BSA/FinCEN reporting frameworks",
      "Third-party vendor risk management",
    ],
    link: "/services",
    linkLabel: "Explore Compliance Services",
    accentColor: "text-violet-400",
    borderColor: "border-l-violet-400",
    iconBg: "bg-violet-900/30",
    reversed: true,
  },
  {
    icon: <Building2 className="w-12 h-12 text-amber-400" />,
    label: "Division 03",
    name: "Alliance Trust Realty",
    description:
      "Institutional real estate investment management delivering superior risk-adjusted returns through disciplined underwriting, active asset management, and a curated network of qualified investors.",
    capabilities: [
      "Commercial & residential acquisitions",
      "Investment fund management",
      "Qualified investor network",
      "Portfolio construction & optimization",
      "Asset management & reporting",
      "1031 exchange & tax structuring",
    ],
    link: "/atr/invest",
    linkLabel: "Explore ATR Investments",
    accentColor: "text-amber-400",
    borderColor: "border-l-amber-400",
    iconBg: "bg-amber-900/30",
    reversed: false,
  },
];

const integratedBenefits = [
  {
    icon: <Lock className="w-6 h-6 text-amber-600" />,
    title: "End-to-End Security",
    description:
      "Every investment transaction and document exchange is protected by GEM's SOC-grade cybersecurity infrastructure — from onboarding to closing.",
  },
  {
    icon: <ClipboardCheck className="w-6 h-6 text-amber-600" />,
    title: "Built-In Compliance",
    description:
      "The Core Compliance Division embeds regulatory oversight directly into ATR's investment workflows, eliminating bottlenecks and reducing regulatory risk.",
  },
  {
    icon: <Layers className="w-6 h-6 text-amber-600" />,
    title: "Unified Reporting",
    description:
      "A single enterprise dashboard delivers consolidated security alerts, compliance status, and investment performance metrics to executive leadership.",
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-600" />,
    title: "Faster Execution",
    description:
      "Pre-integrated systems eliminate inter-vendor delays. From KYC clearance to deal closing, the Alliance ecosystem accelerates every stage of the process.",
  },
];

const metrics = [
  { icon: <BarChart3 className="w-8 h-8 text-amber-400" />, value: "$2.8B+", label: "Assets Under Management" },
  { icon: <Users className="w-8 h-8 text-amber-400" />, value: "500+", label: "Enterprise Clients" },
  { icon: <TrendingUp className="w-8 h-8 text-amber-400" />, value: "99.97%", label: "Compliance Rate" },
  { icon: <Clock className="w-8 h-8 text-amber-400" />, value: "24/7", label: "SOC Operations" },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-white text-[hsl(222,47%,11%)]">
      {/* Hero */}
      <section className="relative bg-[hsl(222,47%,11%)] py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="text-amber-600 text-xs tracking-widest uppercase mb-4 font-semibold">Enterprise</p>
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Enterprise Solutions
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto">
            The Alliance Enterprise ecosystem integrates three world-class divisions to deliver unmatched security, compliance, and real estate investment solutions.
          </p>
        </div>
      </section>

      {/* Enterprise Metrics */}
      <section className="bg-amber-600 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center mb-3">{metric.icon}</div>
                <p
                  className="text-4xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {metric.value}
                </p>
                <p className="text-amber-100 text-sm">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Division Sections — Alternating Layout */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Our Divisions</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Three Divisions, One Ecosystem
            </h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              Each division operates as a standalone center of excellence while integrating seamlessly with the others to deliver a unified enterprise experience.
            </p>
          </div>

          <div className="space-y-20">
            {divisions.map((division, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${division.reversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 items-start`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className={`border-l-4 ${division.borderColor} pl-6 mb-8`}>
                    <p className={`text-xs tracking-widest uppercase font-semibold mb-2 ${division.accentColor}`}>
                      {division.label}
                    </p>
                    <h3
                      className="text-3xl font-bold text-[hsl(222,47%,11%)] mb-4"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {division.name}
                    </h3>
                    <p className="text-slate-500 text-lg leading-relaxed">{division.description}</p>
                  </div>
                  <Link href={division.link}>
                    <Button className="bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,18%)] text-white h-11 px-6">
                      {division.linkLabel} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Capabilities Card */}
                <div className="flex-1">
                  <Card className={`border border-slate-200 border-l-4 ${division.borderColor} bg-[#f8fafc] shadow-sm`}>
                    <CardContent className="p-8">
                      <div className={`p-4 rounded-xl ${division.iconBg} w-fit mb-6`}>{division.icon}</div>
                      <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-4">
                        Key Capabilities
                      </p>
                      <ul className="space-y-3">
                        {division.capabilities.map((cap, ci) => (
                          <li key={ci} className="flex items-start gap-3 text-slate-600 text-sm">
                            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${division.accentColor}`} />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why the Integrated Approach */}
      <section className="bg-[#f8fafc] py-20 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">Integration</p>
            <h2
              className="text-4xl font-bold text-[hsl(222,47%,11%)]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Why the Integrated Approach
            </h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              The Alliance Enterprise model eliminates the fragmentation of working with multiple vendors — delivering superior outcomes through a single, trusted ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integratedBenefits.map((benefit, idx) => (
              <Card key={idx} className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mb-4">
                    {benefit.icon}
                  </div>
                  <h3
                    className="text-lg font-bold text-[hsl(222,47%,11%)] mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {benefit.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[hsl(222,47%,11%)] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Globe className="w-12 h-12 text-amber-400 mx-auto mb-6" />
            <h2
              className="text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Schedule an Enterprise Consultation
            </h2>
            <p className="text-slate-300 text-lg mb-10">
              Speak with an Alliance Enterprise advisor to discover how our integrated cybersecurity, compliance, and real estate capabilities can serve your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white/10 rounded-xl p-5 text-center">
              <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-sm font-semibold mb-1">GEM Cybersecurity</p>
              <p className="text-slate-400 text-xs">SOC & threat intelligence</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 text-center">
              <Scale className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-white text-sm font-semibold mb-1">Core Compliance</p>
              <p className="text-slate-400 text-xs">AML/KYC & regulatory</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 text-center">
              <Building2 className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-white text-sm font-semibold mb-1">Alliance Trust Realty</p>
              <p className="text-slate-400 text-xs">Real estate investment</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/atr/invest">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 text-base">
                <Phone className="w-4 h-4 mr-2" />
                Schedule Enterprise Consultation
              </Button>
            </Link>
            <Link href="/atr">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                Explore ATR Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
