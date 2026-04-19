import Link from "next/link";
import {
  Shield,
  TrendingUp,
  Eye,
  Lock,
  ArrowRight,
  Award,
  Users,
  Building2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Founded", value: "2018", icon: Building2 },
  { label: "Assets Under Management", value: "$2.8B+", icon: BarChart3 },
  { label: "Clients Served", value: "500+", icon: Users },
  { label: "Avg. Annual Returns", value: "23%", icon: TrendingUp },
];

const team = [
  {
    name: "James Aldridge",
    title: "CEO & Founder",
    initials: "JA",
    bio: "James founded Alliance Trust Realty after 20 years leading institutional real estate investment at Goldman Sachs and Blackstone. Under his leadership, ATR has grown from a boutique advisory to managing over $2.8B in assets across 15 markets.",
    color: "bg-indigo-600",
  },
  {
    name: "Sarah Chen",
    title: "Chief Investment Officer",
    initials: "SC",
    bio: "Sarah oversees ATR's investment strategy and portfolio construction. A former Carlyle Group partner, she brings deep expertise in commercial real estate underwriting, having structured over $4B in transactions across the US and Asia-Pacific.",
    color: "bg-emerald-600",
  },
  {
    name: "Marcus Webb",
    title: "Head of Compliance",
    initials: "MW",
    bio: "Marcus ensures ATR operates at the highest regulatory and ethical standards. With 18 years of securities law experience and prior roles at the SEC and FINRA, he has built one of the most robust compliance frameworks in the private REIT sector.",
    color: "bg-amber-600",
  },
  {
    name: "Dr. Patricia Morgan",
    title: "Chief Risk Officer",
    initials: "PM",
    bio: "Dr. Morgan leads ATR's enterprise risk management and quantitative analysis teams. Holding a Ph.D. in financial economics from MIT, she developed ATR's proprietary risk-scoring methodology that assesses over 200 data points per investment.",
    color: "bg-blue-600",
  },
];

const values = [
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We operate with unwavering honesty in every client interaction, disclosure, and investment decision. Our word is our bond.",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    description:
      "We continuously develop proprietary tools, data models, and investment strategies to identify opportunities others miss.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Our clients receive clear, timely, and comprehensive reporting. We believe informed investors are empowered investors.",
  },
  {
    icon: Lock,
    title: "Security",
    description:
      "From data protection to investment structuring, security is embedded in everything we do — protecting capital and information alike.",
  },
];

const certifications = [
  { label: "SEC Registered", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "FINRA Member", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { label: "SOC 2 Type II", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "ISO 27001", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[hsl(222,47%,11%)] text-white py-32 px-6 overflow-hidden">
        {/* Gradient overlay layers for building background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(222,47%,11%)] to-[hsl(222,60%,18%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-4">
            OUR STORY
          </p>
          <h1
            className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            About Alliance Trust Realty
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            A decade of disciplined investing, exceptional returns, and
            unwavering commitment to our clients' financial futures.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-4">
            OUR MISSION
          </p>
          <h2
            className="text-3xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Democratizing Institutional-Grade Real Estate Investment
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Alliance Trust Realty was founded on the belief that accredited
            investors deserve access to the same institutional-quality real
            estate investments previously reserved for sovereign wealth funds and
            endowments. We combine rigorous underwriting, transparent reporting,
            and decades of expertise to deliver superior risk-adjusted returns
            for every client we serve.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-[hsl(222,47%,11%)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                    <Icon size={22} className="text-amber-400" />
                  </div>
                  <p
                    className="text-4xl font-bold text-white mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              LEADERSHIP
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The Team Behind ATR
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
              Over 80 years of combined experience across investment management,
              real estate, and financial regulation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <Card
                key={member.name}
                className="border border-slate-200 shadow-sm bg-white"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-full ${member.color} text-white flex items-center justify-center text-lg font-bold shrink-0`}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold text-slate-900"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                      >
                        {member.name}
                      </h3>
                      <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mt-0.5">
                        {member.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mt-4">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-xs tracking-widest uppercase font-semibold mb-3">
              WHAT WE STAND FOR
            </p>
            <h2
              className="text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="text-center px-4 py-8 rounded-2xl bg-[#f8fafc] border border-slate-100"
                >
                  <div className="w-14 h-14 rounded-full bg-[hsl(222,47%,11%)] flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-amber-400" />
                  </div>
                  <h3
                    className="text-lg font-bold text-slate-900 mb-3"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regulatory & Compliance */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-600 text-xs tracking-widests uppercase font-semibold mb-3">
            REGULATORY & COMPLIANCE
          </p>
          <h2
            className="text-3xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Held to the Highest Standards
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
            Alliance Trust Realty maintains full regulatory compliance and
            independent third-party certification across all aspects of our
            operations, from securities law to information security.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert) => (
              <div
                key={cert.label}
                className={`flex items-center gap-2 px-5 py-3 rounded-full border ${cert.color} font-semibold text-sm`}
              >
                <Award size={16} />
                {cert.label}
              </div>
            ))}
          </div>
          <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 text-left max-w-2xl mx-auto">
            <h3
              className="text-lg font-bold text-slate-900 mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Our Compliance Commitment
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {[
                "Annual independent audit by a Big Four accounting firm",
                "Quarterly regulatory filings with the SEC and FINRA",
                "AML/KYC screening for all investors and counterparties",
                "Continuous monitoring of portfolio companies for compliance",
                "Annual third-party penetration testing and security review",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Shield
                    size={14}
                    className="text-emerald-500 mt-0.5 shrink-0"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[hsl(222,47%,11%)] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-400 text-xs tracking-widest uppercase font-semibold mb-4">
            GET STARTED
          </p>
          <h2
            className="text-4xl font-bold mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ready to Invest with Alliance Trust Realty?
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Join 500+ accredited investors who trust ATR to grow and protect
            their wealth through institutional-quality real estate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              asChild
            >
              <Link href="/atr/invest">
                Start Investing Today
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900"
              asChild
            >
              <Link href="/atr/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
