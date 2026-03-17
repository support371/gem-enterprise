"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Building2,
  Shield,
  ClipboardCheck,
  TrendingUp,
  Award,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GALLERY = [
  {
    emoji: "🏢",
    title: "Alliance Trust Realty HQ",
    category: "Corporate Real Estate",
    badge: "LEED Certified",
    description:
      "Main headquarters showcasing sustainable architecture and modern business practices",
    features: [
      "Smart building technology",
      "Energy-efficient systems",
      "Eco-friendly materials",
    ],
  },
  {
    emoji: "🏬",
    title: "Commercial Portfolio",
    category: "Investment Properties",
    badge: "Green Building",
    description:
      "Strategic commercial investments with integrated security and compliance systems",
    features: [
      "Advanced security integration",
      "Compliance monitoring",
      "Sustainable operations",
    ],
  },
  {
    emoji: "🏘️",
    title: "Mixed-Use Development",
    category: "Development Projects",
    badge: "Carbon Neutral",
    description:
      "Innovative mixed-use spaces combining business, residential, and community areas",
    features: [
      "Community integration",
      "Environmental stewardship",
      "Smart city planning",
    ],
  },
  {
    emoji: "🏭",
    title: "Technology Integration Hub",
    category: "Tech Infrastructure",
    badge: "Renewable Energy",
    description:
      "State-of-the-art facility demonstrating our cybersecurity and compliance integration",
    features: [
      "24/7 monitoring center",
      "Compliance testing lab",
      "Sustainable operations",
    ],
  },
  {
    emoji: "🏢",
    title: "Sustainable Office Spaces",
    category: "Office Real Estate",
    badge: "Zero Waste",
    description:
      "Modern office environments designed for productivity and environmental responsibility",
    features: [
      "Biophilic design",
      "Energy optimization",
      "Employee wellness focus",
    ],
  },
  {
    emoji: "🏘️",
    title: "Community Development",
    category: "Community Projects",
    badge: "Social Impact",
    description:
      "Real estate projects that strengthen communities while maintaining profitability",
    features: [
      "Affordable housing",
      "Local economic growth",
      "Sustainable impact",
    ],
  },
];

const PROOF = [
  {
    icon: TrendingUp,
    title: "Enterprise Security Overhaul",
    description:
      "Complete cybersecurity transformation for a Fortune 500 company, reducing security incidents by 95% and achieving full compliance certification.",
    client: "Fortune 500 Enterprise",
    metric: "95% Incident Reduction",
    color: "cyan",
  },
  {
    icon: Award,
    title: "Multi-Industry Compliance",
    description:
      "Streamlined regulatory compliance across healthcare, finance, and manufacturing sectors, achieving 100% audit success rate.",
    client: "Multi-Sector Project",
    metric: "100% Audit Success",
    color: "emerald",
  },
  {
    icon: BarChart3,
    title: "Strategic Portfolio Growth",
    description:
      "Real estate investment strategy delivering 23% annual returns through strategic acquisitions and portfolio optimization.",
    client: "Institutional Portfolio",
    metric: "23% Annual Returns",
    color: "amber",
  },
];

export default function ATRPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [email, setEmail] = useState("");

  const visibleCount = 3;
  const maxIndex = GALLERY.length - visibleCount;

  const prevSlide = () => setGalleryIndex((i) => Math.max(0, i - 1));
  const nextSlide = () => setGalleryIndex((i) => Math.min(maxIndex, i + 1));

  const proofColorMap: Record<
    string,
    { border: string; bg: string; text: string; metricBg: string }
  > = {
    cyan: {
      border: "border-cyan-500",
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      metricBg: "bg-cyan-100",
    },
    emerald: {
      border: "border-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      metricBg: "bg-emerald-100",
    },
    amber: {
      border: "border-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      metricBg: "bg-amber-100",
    },
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ── 1. FULL-SCREEN VIDEO HERO ── */}
      <section
        className="relative min-h-screen flex flex-col justify-end"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10, 15, 30, 0.65)" }}
        />

        {/* Video player controls — centered */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-8">
            {/* Skip back */}
            <button
              onClick={() => {}}
              aria-label="Skip back 10 seconds"
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wide">10</span>
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-20 h-20 rounded-full border-2 border-white/70 hover:border-white flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>

            {/* Skip forward */}
            <button
              onClick={() => {}}
              aria-label="Skip forward 10 seconds"
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
            >
              <span className="text-sm font-medium tracking-wide">10</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom-left text overlay */}
        <div className="relative z-10 px-10 pb-14 max-w-2xl">
          <p className="text-amber-500 text-xs font-semibold tracking-widest uppercase mb-3">
            OUR STORY
          </p>
          <h1
            className="text-white text-5xl lg:text-6xl xl:text-7xl leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            The Evolution
            <br />
            of Excellence
          </h1>
        </div>
      </section>

      {/* ── 2. OUR STORY ── */}
      <section className="py-24 px-6 lg:px-16" style={{ background: "#f8fafc" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-5">
            OUR STORY
          </p>
          <h2
            className="text-slate-900 text-4xl lg:text-5xl leading-snug mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            The Evolution of Excellence
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
            From pioneering cybersecurity solutions to mastering regulatory
            compliance and real estate investment, The Alliance Enterprise
            represents the convergence of three critical pillars of modern
            business success.
          </p>
        </div>
      </section>

      {/* ── 3. OUR DIVISIONS ── */}
      <section className="py-24 px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-5">
            OUR DIVISIONS
          </p>
          <h2
            className="text-slate-900 text-4xl lg:text-5xl mb-14"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Enterprise Solutions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* GEM Cybersecurity */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-cyan-600 text-xs font-semibold tracking-widest uppercase mb-1">
                  Division 01
                </p>
                <h3
                  className="text-slate-900 text-xl font-semibold mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  GEM Cybersecurity &amp; Monitoring
                </h3>
                <p className="text-slate-500 text-sm mb-3">
                  Advanced threat detection &amp; protection
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Enterprise-grade cybersecurity solutions protecting critical
                  infrastructure with real-time monitoring and rapid incident
                  response.
                </p>
              </div>
              <div className="mt-auto">
                <Link
                  href="/gem"
                  className="inline-flex items-center gap-2 text-cyan-600 text-sm font-medium hover:gap-3 transition-all duration-200"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Core Compliance */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-1">
                  Division 02
                </p>
                <h3
                  className="text-slate-900 text-xl font-semibold mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Core Compliance Division
                </h3>
                <p className="text-slate-500 text-sm mb-3">
                  Regulatory mastery across industries
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Comprehensive compliance frameworks ensuring organizations
                  meet and exceed regulatory requirements across all sectors.
                </p>
              </div>
              <div className="mt-auto">
                <Link
                  href="/compliance"
                  className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium hover:gap-3 transition-all duration-200"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Alliance Trust Realty */}
            <div className="border border-amber-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4 bg-amber-50/30">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-1">
                  Division 03
                </p>
                <h3
                  className="text-slate-900 text-xl font-semibold mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Alliance Trust Realty
                </h3>
                <p className="text-slate-500 text-sm mb-3">
                  Strategic real estate investment
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Premium real estate investment strategies delivering
                  consistent returns through data-driven acquisitions and
                  portfolio management.
                </p>
              </div>
              <div className="mt-auto">
                <Link
                  href="/atr"
                  className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium hover:gap-3 transition-all duration-200"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. STATS BAR ── */}
      <section
        className="py-20 px-6 lg:px-16"
        style={{ background: "hsl(222, 47%, 11%)" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {[
            { value: "$2.8B+", label: "Assets Under Management" },
            { value: "500+", label: "Enterprise Clients" },
            { value: "99.97%", label: "Compliance Rate" },
            { value: "23%", label: "Avg. Annual Returns" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <span
                className="text-white text-4xl lg:text-5xl font-bold"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </span>
              <span className="text-slate-400 text-sm tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. PROPERTY GALLERY CAROUSEL ── */}
      <section className="py-24 px-6 lg:px-16 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-4">
                PORTFOLIO
              </p>
              <h2
                className="text-slate-900 text-4xl lg:text-5xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Our Properties
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={prevSlide}
                disabled={galleryIndex === 0}
                aria-label="Previous properties"
                className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={nextSlide}
                disabled={galleryIndex >= maxIndex}
                aria-label="Next properties"
                className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(calc(-${galleryIndex} * (33.333% + 8px)))`,
              }}
            >
              {GALLERY.map((property, idx) => (
                <div
                  key={idx}
                  className="min-w-[calc(33.333%-16px)] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Emoji hero */}
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                    <span className="text-7xl">{property.emoji}</span>
                    <span className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
                      {property.badge}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col gap-3">
                    <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase">
                      {property.category}
                    </p>
                    <h3
                      className="text-slate-900 text-lg font-semibold leading-snug"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {property.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {property.description}
                    </p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {property.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-slate-500 text-xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === galleryIndex
                    ? "bg-amber-600 w-6"
                    : "bg-slate-300 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PROOF OF CONCEPT ── */}
      <section className="py-24 px-6 lg:px-16" style={{ background: "#fafaf8" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-5">
            IMPACT
          </p>
          <h2
            className="text-slate-900 text-4xl lg:text-5xl mb-14"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Proven Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROOF.map((item) => {
              const colors = proofColorMap[item.color];
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`rounded-2xl border-t-4 ${colors.border} bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h3
                      className="text-slate-900 text-xl font-semibold mb-2"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-slate-400 text-xs">{item.client}</span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.metricBg} ${colors.text}`}
                    >
                      {item.metric}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. NEWSLETTER CTA ── */}
      <section
        className="py-24 px-6 lg:px-16"
        style={{ background: "hsl(222, 47%, 11%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-amber-500 text-xs font-semibold tracking-widest uppercase mb-5">
            STAY INFORMED
          </p>
          <h2
            className="text-white text-4xl lg:text-5xl mb-5 leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Insights Delivered to Your Inbox
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Join our network of enterprise leaders receiving exclusive market
            intelligence, compliance updates, and investment opportunities.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500"
            />
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 whitespace-nowrap"
            >
              Subscribe
            </Button>
          </form>

          <p className="text-slate-500 text-xs mt-5">
            No spam. Unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </section>
    </main>
  );
}
