"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  DollarSign,
  Briefcase,
  GraduationCap,
  HomeIcon,
  CheckCircle2,
  Star,
  MapPin,
  ShieldCheck,
  FileText,
  Users,
  Globe2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Dynamic imports for client-only widgets
const ROICalculator = dynamic(
  () => import("@/components/atr/ROICalculator").then((m) => m.ROICalculator),
  { ssr: false }
);
const CryptoMarketTable = dynamic(
  () => import("@/components/atr/CryptoMarketTable").then((m) => m.CryptoMarketTable),
  { ssr: false }
);
const TradingViewCalendar = dynamic(
  () => import("@/components/atr/TradingViewWidgets").then((m) => m.TradingViewCalendar),
  { ssr: false }
);

// ── Data ─────────────────────────────────────────────────────────────────────

const GALLERY = [
  { emoji: "🏢", title: "Alliance Trust Realty HQ", category: "Corporate Real Estate", badge: "LEED Certified", description: "Main headquarters showcasing sustainable architecture and modern business practices", features: ["Smart building technology", "Energy-efficient systems", "Eco-friendly materials"] },
  { emoji: "🏬", title: "Commercial Portfolio", category: "Investment Properties", badge: "Green Building", description: "Strategic commercial investments with integrated security and compliance systems", features: ["Advanced security integration", "Compliance monitoring", "Sustainable operations"] },
  { emoji: "🏘️", title: "Mixed-Use Development", category: "Development Projects", badge: "Carbon Neutral", description: "Innovative mixed-use spaces combining business, residential, and community areas", features: ["Community integration", "Environmental stewardship", "Smart city planning"] },
  { emoji: "🏭", title: "Technology Integration Hub", category: "Tech Infrastructure", badge: "Renewable Energy", description: "State-of-the-art facility demonstrating our cybersecurity and compliance integration", features: ["24/7 monitoring center", "Compliance testing lab", "Sustainable operations"] },
  { emoji: "🏢", title: "Sustainable Office Spaces", category: "Office Real Estate", badge: "Zero Waste", description: "Modern office environments designed for productivity and environmental responsibility", features: ["Biophilic design", "Energy optimization", "Employee wellness focus"] },
  { emoji: "🏘️", title: "Community Development", category: "Community Projects", badge: "Social Impact", description: "Real estate projects that strengthen communities while maintaining profitability", features: ["Affordable housing", "Local economic growth", "Sustainable impact"] },
];

const PROPERTIES = [
  { title: "Downtown Multi-Family Asset", location: "Austin, TX", price: "$2.50M", cap: "7.2% cap rate", type: "Multi-Family", badge: "Featured", img: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80", bestFor: "Income-focused investors", desc: "Stabilized multi-family asset positioned for structured investor review, cash-flow analysis, and long-term hold discussion." },
  { title: "Commercial Office Redevelopment", location: "Dallas, TX", price: "$4.20M", cap: "6.8% cap rate", type: "Commercial", badge: "Opportunity", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", bestFor: "Redevelopment strategy", desc: "Commercial building opportunity suitable for acquisition review, repositioning discussions, and strategic real-estate planning." },
  { title: "Single-Family Rental Portfolio", location: "Houston, TX", price: "$1.80M", cap: "6.5% cap rate", type: "Residential Portfolio", badge: "Available", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80", bestFor: "Portfolio expansion", desc: "Curated single-family rental portfolio for investors seeking long-term residential income exposure." },
];

const SERVICES = [
  { icon: HomeIcon, title: "Residential Buying Support", desc: "Guided acquisition support for clients navigating residential purchases with more confidence, structure, and market clarity.", points: ["Buyer-readiness review", "Property shortlisting support", "Offer and next-step planning"], color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: DollarSign, title: "Residential Selling Support", desc: "Positioning, sale-readiness, and structured transaction guidance for owners preparing to sell strategically.", points: ["Listing-readiness guidance", "Pricing context support", "Seller communication workflow"], color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: TrendingUp, title: "Investment Property Analysis", desc: "Real-estate opportunity analysis for income potential, cap-rate awareness, and long-term portfolio fit.", points: ["Cash-flow framing", "Cap-rate awareness", "Portfolio suitability review"], color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Building2, title: "Commercial Real Estate", desc: "Commercial advisory for acquisition review, repositioning analysis, and opportunity evaluation.", points: ["Asset opportunity review", "Commercial strategy support", "Acquisition-readiness guidance"], color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Briefcase, title: "Mortgage Guidance", desc: "Financing-readiness support for buyers, investors, and clients preparing for lender conversations.", points: ["Mortgage preparation", "Refinance readiness", "Financing document awareness"], color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: GraduationCap, title: "Investor Education", desc: "Educational support to help clients understand property evaluation, financing, and disciplined decision-making.", points: ["Real-estate literacy", "Risk awareness", "Investor orientation guidance"], color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

const TESTIMONIALS = [
  { text: "The structure and clarity helped us understand the opportunity without feeling pushed.", label: "Investor-focused experience" },
  { text: "The platform feels more secure, more professional, and easier to trust than a generic investment site.", label: "Client trust statement" },
  { text: "The consultation-first approach made the process clearer before any major decision was made.", label: "Process confidence" },
];

const FAQ_DATA = [
  { q: "What does Alliance Trust Realty focus on?", a: "Alliance Trust Realty focuses on real-estate advisory, investment-property guidance, mortgage support, investor education, and secure client onboarding under the GEM operating model." },
  { q: "Is this a crypto or trading platform?", a: "No. Alliance Trust Realty is a real-estate-first business. Broader analytics and adjacent financial intelligence sit under GEM separately and are not the core public offering here." },
  { q: "How do clients get started?", a: "Clients can begin with a consultation request, property inquiry, financing discussion, or investor-access request depending on their goals." },
  { q: "What is the investor portal for?", a: "The portal is intended for secure onboarding, property visibility, investor access, and future dashboard-level account workflows." },
  { q: "What kind of properties do you manage?", a: "We handle residential, commercial, multi-family, and industrial real estate assets across major US markets with a focus on income-generating properties." },
];

const PROOF = [
  { icon: TrendingUp, title: "Enterprise Security Overhaul", description: "Complete cybersecurity transformation for a Fortune 500 company, reducing security incidents by 95% and achieving full compliance certification.", client: "Fortune 500 Enterprise", metric: "95% Incident Reduction", color: "cyan" },
  { icon: Award, title: "Multi-Industry Compliance", description: "Streamlined regulatory compliance across healthcare, finance, and manufacturing sectors, achieving 100% audit success rate.", client: "Multi-Sector Project", metric: "100% Audit Success", color: "emerald" },
  { icon: BarChart3, title: "Strategic Portfolio Growth", description: "Real estate investment strategy delivering 23% annual returns through strategic acquisitions and portfolio optimization.", client: "Institutional Portfolio", metric: "23% Annual Returns", color: "amber" },
];

const proofColorMap: Record<string, { border: string; bg: string; text: string; metricBg: string }> = {
  cyan: { border: "border-cyan-500", bg: "bg-cyan-50", text: "text-cyan-700", metricBg: "bg-cyan-100" },
  emerald: { border: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", metricBg: "bg-emerald-100" },
  amber: { border: "border-amber-500", bg: "bg-amber-50", text: "text-amber-700", metricBg: "bg-amber-100" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-6 text-left font-bold text-lg hover:text-blue-600 transition-colors">
        <span>{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 ml-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="px-6 text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ATRPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [email, setEmail] = useState("");

  const visibleCount = 3;
  const maxIndex = GALLERY.length - visibleCount;
  const prevSlide = () => setGalleryIndex((i) => Math.max(0, i - 1));
  const nextSlide = () => setGalleryIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative h-screen w-full overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(10,15,30,0.62)" }} />

        {/* Centered video controls */}
        <div className="absolute inset-0 flex items-center justify-center gap-10 z-10">
          <button onClick={() => {}} aria-label="Skip back 10 seconds" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors font-mono text-sm">
            <ChevronLeft className="w-4 h-4" />
            10
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-16 h-16 rounded-full border-2 border-white/50 hover:border-white flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all"
          >
            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
          </button>
          <button onClick={() => {}} aria-label="Skip forward 10 seconds" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors font-mono text-sm">
            10
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-left title overlay */}
        <div className="absolute bottom-12 left-8 lg:left-14 max-w-xl z-10">
          <p className="text-xs tracking-[0.3em] text-amber-400/80 uppercase mb-3 font-medium">Our Story</p>
          <h1
            className="text-4xl lg:text-6xl text-white leading-tight"
            style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}
          >
            The Evolution<br />of Excellence
          </h1>
        </div>

        {/* Bottom-right CTAs */}
        <div className="absolute bottom-12 right-8 lg:right-14 z-10 flex flex-col sm:flex-row gap-3">
          <Link href="/atr/invest">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-7 rounded-full">
              Schedule Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/atr/buy">
            <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 font-semibold px-7 rounded-full backdrop-blur-sm">
              Explore Properties
            </Button>
          </Link>
        </div>
      </section>

      {/* ── OUR STORY ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16" style={{ background: "#f8fafc" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-amber-600 uppercase mb-5 font-medium">Our Story</p>
          <h2
            className="text-4xl lg:text-5xl mb-8 leading-snug"
            style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", color: "hsl(222,47%,11%)" }}
          >
            The Evolution of Excellence
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
            From pioneering cybersecurity solutions to mastering regulatory compliance and real
            estate investment, The Alliance Enterprise represents the convergence of three critical
            pillars of modern business success. We combine institutional discipline with
            client-first design — delivering secure, transparent, and high-conviction investment
            experiences across every engagement.
          </p>
          <div className="grid grid-cols-3 gap-8 mt-14">
            {[
              { value: "$2.8B+", label: "Assets Under Management" },
              { value: "23%", label: "Avg. Annual Returns" },
              { value: "500+", label: "Enterprise Clients" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1 border-l-2 border-amber-400 pl-5">
                <span
                  className="text-3xl font-bold"
                  style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", color: "hsl(222,47%,11%)" }}
                >
                  {s.value}
                </span>
                <span className="text-sm text-slate-500 tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16" style={{ background: "hsl(222,47%,11%)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {[
            { value: "$2.8B+", label: "Assets Under Management" },
            { value: "500+", label: "Enterprise Clients" },
            { value: "99.97%", label: "Compliance Rate" },
            { value: "23%", label: "Avg. Annual Returns" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <span className="text-white text-4xl lg:text-5xl font-bold" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
                {stat.value}
              </span>
              <span className="text-slate-400 text-sm tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR DIVISIONS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-5">OUR DIVISIONS</p>
          <h2 className="text-slate-900 text-4xl lg:text-5xl mb-14" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
            Enterprise Solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-cyan-600 text-xs font-semibold tracking-widest uppercase mb-1">Division 01</p>
                <h3 className="text-slate-900 text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>GEM Cybersecurity & Monitoring</h3>
                <p className="text-slate-500 text-sm mb-3">Advanced threat detection & protection</p>
                <p className="text-slate-600 text-sm leading-relaxed">Enterprise-grade cybersecurity solutions protecting critical infrastructure with real-time monitoring and rapid incident response.</p>
              </div>
              <div className="mt-auto">
                <Link href="/gem" className="inline-flex items-center gap-2 text-cyan-600 text-sm font-medium hover:gap-3 transition-all duration-200">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-600 text-xs font-semibold tracking-widest uppercase mb-1">Division 02</p>
                <h3 className="text-slate-900 text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>Core Compliance Division</h3>
                <p className="text-slate-500 text-sm mb-3">Regulatory mastery across industries</p>
                <p className="text-slate-600 text-sm leading-relaxed">Comprehensive compliance frameworks ensuring organizations meet and exceed regulatory requirements across all sectors.</p>
              </div>
              <div className="mt-auto">
                <Link href="/compliance" className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium hover:gap-3 transition-all duration-200">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="border border-amber-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4 bg-amber-50/30">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-1">Division 03</p>
                <h3 className="text-slate-900 text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>Alliance Trust Realty</h3>
                <p className="text-slate-500 text-sm mb-3">Strategic real estate investment</p>
                <p className="text-slate-600 text-sm leading-relaxed">Premium real estate investment strategies delivering consistent returns through data-driven acquisitions and portfolio management.</p>
              </div>
              <div className="mt-auto">
                <Link href="/atr" className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium hover:gap-3 transition-all duration-200">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-950 border-y border-white/5 relative overflow-hidden" id="services">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-blue-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">What We Offer</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
              Real-Estate Guidance Built for Modern Clients
            </h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Whether you&apos;re buying, selling, or investing, we provide expert guidance tailored to your unique goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-500 cursor-pointer">
                <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <s.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{s.title}</h3>
                <p className="text-slate-400 font-light leading-relaxed mb-4 text-sm">{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 className={`h-4 w-4 ${s.color} shrink-0`} />
                      {p}
                    </li>
                  ))}
                </ul>
                <span className={`text-sm font-bold uppercase tracking-widest ${s.color} flex items-center gap-2`}>
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROPERTY GALLERY CAROUSEL ──────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-4">PORTFOLIO</p>
              <h2 className="text-slate-900 text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
                Our Properties
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={prevSlide} disabled={galleryIndex === 0} aria-label="Previous properties" className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={nextSlide} disabled={galleryIndex >= maxIndex} aria-label="Next properties" className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex gap-6 transition-transform duration-500 ease-in-out" style={{ transform: `translateX(calc(-${galleryIndex} * (33.333% + 8px)))` }}>
              {GALLERY.map((property, idx) => (
                <div key={idx} className="min-w-[calc(33.333%-16px)] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                    <span className="text-7xl">{property.emoji}</span>
                    <span className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide">{property.badge}</span>
                  </div>
                  <div className="p-6 flex flex-col gap-3">
                    <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase">{property.category}</p>
                    <h3 className="text-slate-900 text-lg font-semibold leading-snug" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>{property.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{property.description}</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {property.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-slate-500 text-xs">
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
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button key={i} onClick={() => setGalleryIndex(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2 rounded-full transition-all duration-200 ${i === galleryIndex ? "bg-amber-600 w-6" : "bg-slate-300 w-2"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTY LISTINGS ────────────────────────────────────── */}
      <section className="py-24 bg-white" id="properties">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <span className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-xs block mb-3">Featured Opportunities</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
              Property & Investment-Ready Opportunities
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PROPERTIES.map((p, i) => (
              <article key={i} className="group rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="h-72 bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${p.img})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute top-5 left-5 z-10">
                    <span className="px-3 py-1.5 bg-white/90 text-slate-900 text-xs font-bold rounded-full">{p.badge}</span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-200 mb-1">{p.type}</div>
                    <h3 className="text-2xl font-black">{p.title}</h3>
                    <div className="text-sm text-slate-300 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {p.location}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="font-bold text-slate-900">{p.price}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400">Yield Context</div>
                      <div className="font-bold text-slate-900">{p.cap}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{p.desc}</p>
                  <p className="text-sm text-slate-700 font-semibold mb-5"><strong>Best For:</strong> {p.bestFor}</p>
                  <div className="flex gap-3">
                    <Link href="/atr/invest">
                      <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl">Request Details</Button>
                    </Link>
                    <Button size="sm" variant="outline" className="font-bold rounded-xl">Schedule Review</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI CALCULATOR ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden" id="calculator">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(at 20% 30%, rgba(255,255,255,0.15) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(212,165,116,0.1) 0px, transparent 50%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
              Investment ROI Calculator
            </h2>
            <p className="text-blue-100 text-lg mt-4 max-w-2xl mx-auto">
              Calculate potential returns on your real estate investment with our comprehensive analysis tool.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ROICalculator />
          </div>
        </div>
      </section>

      {/* ── MARKET INTELLIGENCE ────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-xs">Data Driven</span>
              <h2 className="text-4xl font-black text-slate-900 mt-3" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
                Market Intelligence
              </h2>
            </div>
            <p className="text-gray-500 max-w-md text-right mt-4 md:mt-0">
              Real-time economic indicators and asset performance data to inform your investment decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>Global Economic Calendar</h3>
                <span className="text-xs text-gray-400">Powered by TradingView</span>
              </div>
              <div className="h-[calc(100%-50px)]">
                <TradingViewCalendar />
              </div>
            </div>
            <div className="lg:col-span-1 h-full flex flex-col gap-6">
              <div className="flex-1">
                <CryptoMarketTable />
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-center text-center">
                <h4 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>Digital Asset Integration</h4>
                <p className="text-sm text-gray-300 mb-6">We monitor the digital asset ecosystem to identify emerging trends that impact real estate tokenization and settlement layers.</p>
                <Link href="/atr/invest">
                  <Button variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white w-full">
                    View Analysis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF OF CONCEPT ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16" style={{ background: "#fafaf8" }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-amber-600 text-xs font-semibold tracking-widest uppercase mb-5">IMPACT</p>
          <h2 className="text-slate-900 text-4xl lg:text-5xl mb-14" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
            Proven Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROOF.map((item) => {
              const colors = proofColorMap[item.color];
              const Icon = item.icon;
              return (
                <div key={item.title} className={`rounded-2xl border-t-4 ${colors.border} bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4`}>
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-slate-400 text-xs">{item.client}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.metricBg} ${colors.text}`}>{item.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <span className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-xs block mb-3">Client Confidence</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
              Built for Trust and Conversion
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-lg font-semibold text-slate-800 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm text-gray-500 font-medium">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PILLARS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, eyebrow: "Why Us", title: "Real-estate-first, trust-led.", desc: "The platform is designed to reduce noise, improve clarity, and create a stronger client journey from inquiry to engagement." },
              { icon: Users, eyebrow: "Workflow", title: "Consultation before complexity.", desc: "We use a consultation-first model to align services, investor readiness, property needs, and financing paths." },
              { icon: Globe2, eyebrow: "Future-ready", title: "Built to grow into a platform.", desc: "Alliance Trust Realty is structured to expand into secure onboarding, user access, property visibility, and investor tools." },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <item.icon className="h-7 w-7" />
                </div>
                <span className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-xs">{item.eyebrow}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 mb-4" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white" id="faq">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-12">
            <span className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-xs block mb-3">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
              Clear Answers for Clients & Investors
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── INVESTOR PORTAL CTA ────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50" id="portal">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl p-10 md:p-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
              Investor Portal
            </h2>
            <p className="text-gray-500 text-lg max-w-3xl mb-8">
              Secure investor access, onboarding, property visibility, and future investment tracking workflows are being expanded inside the Alliance Trust Realty platform.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: ShieldCheck, label: "Secure onboarding" },
                { icon: Building2, label: "Property visibility" },
                { icon: BarChart3, label: "Future dashboard access" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-slate-900">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link href="/atr/login">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-6 rounded-xl">Login</Button>
              </Link>
              <Link href="/atr/register">
                <Button variant="outline" className="font-bold px-8 py-6 rounded-xl">Request Access</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16" style={{ background: "hsl(222,47%,11%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-amber-500 text-xs font-semibold tracking-widest uppercase mb-5">STAY INFORMED</p>
          <h2 className="text-white text-4xl lg:text-5xl mb-5 leading-snug" style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}>
            Insights Delivered to Your Inbox
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Join our network of enterprise leaders receiving exclusive market intelligence, compliance updates, and investment opportunities.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-amber-500"
            />
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 whitespace-nowrap">
              Subscribe
            </Button>
          </form>
          <p className="text-slate-500 text-xs mt-5">No spam. Unsubscribe at any time. We respect your privacy.</p>
        </div>
      </section>

      {/* ── LEGAL ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Privacy Policy", desc: "Client information is handled for service response, communication, and secure operational processing." },
              { title: "Terms of Use", desc: "Site use, service inquiry behavior, and informational limitations should be governed by formal production terms." },
              { title: "Disclosures", desc: "Alliance Trust Realty does not present guaranteed returns. Property and investment information should be reviewed with appropriate professional judgment." },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <FileText className="h-6 w-6 text-gray-400 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
