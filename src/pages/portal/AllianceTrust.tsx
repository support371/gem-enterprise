import React, { useMemo, useState } from "react";
import {
  Building2,
  ShieldCheck,
  Landmark,
  GraduationCap,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  BadgeCheck,
  Users,
  BriefcaseBusiness,
  Home,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Home,
    title: "Residential Buying Support",
    summary:
      "Guided acquisition support for clients navigating residential purchases with more confidence, structure, and market clarity.",
    bullets: ["Buyer-readiness review", "Property shortlisting support", "Offer and next-step planning"],
  },
  {
    icon: Building2,
    title: "Residential Selling Support",
    summary:
      "Positioning, sale-readiness, and structured transaction guidance for owners preparing to sell strategically.",
    bullets: ["Listing-readiness guidance", "Pricing context support", "Seller communication workflow"],
  },
  {
    icon: BriefcaseBusiness,
    title: "Investment Property Analysis",
    summary:
      "Real-estate opportunity analysis for income potential, cap-rate awareness, and long-term portfolio fit.",
    bullets: ["Cash-flow framing", "Cap-rate awareness", "Portfolio suitability review"],
  },
  {
    icon: Building2,
    title: "Commercial Real Estate",
    summary:
      "Commercial advisory for acquisition review, repositioning analysis, and opportunity evaluation.",
    bullets: ["Asset opportunity review", "Commercial strategy support", "Acquisition-readiness guidance"],
  },
  {
    icon: Landmark,
    title: "Mortgage Guidance",
    summary:
      "Financing-readiness support for buyers, investors, and clients preparing for lender conversations.",
    bullets: ["Mortgage preparation", "Refinance readiness", "Financing document awareness"],
  },
  {
    icon: GraduationCap,
    title: "Investor Education",
    summary:
      "Educational support to help clients better understand property evaluation, financing, and disciplined decision-making.",
    bullets: ["Real-estate literacy", "Risk awareness", "Investor orientation guidance"],
  },
];

const opportunities = [
  {
    name: "Downtown Multi-Family Asset",
    type: "Multi-Family",
    location: "Austin, TX",
    price: "$2.50M",
    capRate: "7.2% cap rate",
    status: "Featured",
    bestFor: "Income-focused investors",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
    summary:
      "Stabilized multi-family asset positioned for structured investor review, cash-flow analysis, and long-term hold discussion.",
  },
  {
    name: "Commercial Office Redevelopment",
    type: "Commercial",
    location: "Dallas, TX",
    price: "$4.20M",
    capRate: "6.8% cap rate",
    status: "Opportunity",
    bestFor: "Redevelopment strategy",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
    summary:
      "Commercial building opportunity suitable for acquisition review, repositioning discussions, and strategic real-estate planning.",
  },
  {
    name: "Single-Family Rental Portfolio",
    type: "Residential Portfolio",
    location: "Houston, TX",
    price: "$1.80M",
    capRate: "6.5% cap rate",
    status: "Available",
    bestFor: "Portfolio expansion",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80",
    summary:
      "Curated single-family rental portfolio for investors seeking long-term residential income exposure and portfolio-support conversations.",
  },
];

const trustPillars = [
  { icon: ShieldCheck, title: "Security-led operations", text: "Structured digital workflows designed to support trust and continuity." },
  { icon: Users, title: "Investor-focused guidance", text: "Clear service pathways for buyers, sellers, and property investors." },
  { icon: Landmark, title: "Property and financing support", text: "Real-estate-first guidance across opportunities and lender readiness." },
  { icon: BadgeCheck, title: "Transparent communication", text: "Professional messaging, clean onboarding, and disciplined next steps." },
];

const testimonials = [
  {
    quote: "The structure and clarity helped us understand the opportunity without feeling pushed.",
    byline: "Investor-focused experience statement",
  },
  {
    quote: "The platform feels more secure, more professional, and easier to trust than a generic investment site.",
    byline: "Client trust statement",
  },
  {
    quote: "The consultation-first approach made the process clearer before any major decision was made.",
    byline: "Process confidence statement",
  },
];

const faqs = [
  {
    q: "What does Alliance Trust Realty focus on?",
    a: "Alliance Trust Realty focuses on real-estate advisory, investment-property guidance, mortgage support, investor education, and secure client onboarding under the GEM operating model.",
  },
  {
    q: "Is this a crypto or trading platform?",
    a: "No. Alliance Trust Realty is a real-estate-first business. Broader analytics and adjacent financial intelligence sit under GEM separately and are not the core public offering here.",
  },
  {
    q: "How do clients get started?",
    a: "Clients can begin with a consultation request, property inquiry, financing discussion, or investor-access request depending on their goals.",
  },
  {
    q: "What is the investor portal for?",
    a: "The portal is intended for secure onboarding, property visibility, investor access, and future dashboard-level account workflows.",
  },
];

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-3xl">
      <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</div>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {text ? <p className="mt-5 leading-8 text-muted-foreground">{text}</p> : null}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    cityState: "",
    interest: "Consultation",
    message: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const isValid = useMemo(() => {
    return (
      form.fullName.trim().length >= 2 &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.phone.trim().length >= 7 &&
      form.message.trim().length >= 10 &&
      form.consent
    );
  }, [form]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!isValid) return;
    setSubmitted(true);
  }

  const inputClass =
    "rounded-xl border border-border bg-input px-4 py-3 outline-none transition text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 w-full text-sm";

  return (
    <form onSubmit={onSubmit} className="glass-panel rounded-2xl border border-border/50 p-6 lg:p-8">
      <div className="grid gap-4">
        <input className={inputClass} placeholder="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
        <input className={inputClass} placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        <input className={inputClass} placeholder="City / State" value={form.cityState} onChange={(e) => update("cityState", e.target.value)} />
        <select className={inputClass} value={form.interest} onChange={(e) => update("interest", e.target.value)}>
          <option>Consultation</option>
          <option>Buying Support</option>
          <option>Selling Support</option>
          <option>Investment Advisory</option>
          <option>Mortgage Guidance</option>
          <option>Commercial Real Estate</option>
          <option>Investor Access Request</option>
        </select>
        <textarea className={inputClass} rows={5} placeholder="Tell us what you need" value={form.message} onChange={(e) => update("message", e.target.value)} />
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1 accent-primary" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} />
          <span>I consent to be contacted regarding services and property-related inquiries.</span>
        </label>

        {attempted && !isValid && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            Please complete all required fields before submitting.
          </div>
        )}

        {submitted && (
          <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
            Thank you. Your request has been received. We'll follow up within 1-2 business days.
          </div>
        )}

        <Button type="submit" variant="hero" className="w-full">
          Submit Request
        </Button>
      </div>
    </form>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel rounded-xl border border-border/50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left min-h-[44px]"
      >
        <span className="text-lg font-semibold text-foreground">{q}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 pb-6 text-muted-foreground">{a}</div>}
    </div>
  );
}

export default function AllianceTrust() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    ["about", "About"],
    ["services", "Services"],
    ["properties", "Properties"],
    ["advisory", "Investment Advisory"],
    ["contact", "Contact"],
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-3 text-sm md:flex-row md:items-center md:justify-between">
          <div className="font-medium text-foreground">Powered by GEM Cybersecurity Assist</div>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />support@cybersecurityassist.com</span>
            <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />+1 (401) 702-2460</span>
            <span>Investor Portal</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border glass-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xl font-bold tracking-tight text-foreground">Alliance Trust Realty</div>
            <div className="text-xs text-muted-foreground">Powered by GEM Cybersecurity Assist</div>
          </div>

          <nav className="hidden gap-6 text-sm font-medium text-muted-foreground lg:flex">
            {nav.map(([href, label]) => (
              <a key={href} href={`#${href}`} className="hover:text-foreground transition-colors min-h-[44px] flex items-center">{label}</a>
            ))}
          </nav>

          <div className="hidden gap-3 md:flex">
            <a href="#contact" className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">Schedule Consultation</a>
            <a href="/portal" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Portal</a>
          </div>

          <button className="rounded-xl border border-border p-2 md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-card px-6 py-4 md:hidden">
            <div className="grid gap-3 text-sm font-medium text-muted-foreground">
              {nav.map(([href, label]) => (
                <a key={href} href={`#${href}`} onClick={() => setMobileOpen(false)} className="py-2 min-h-[44px] flex items-center hover:text-foreground transition-colors">{label}</a>
              ))}
              <a href="/portal" onClick={() => setMobileOpen(false)} className="py-2 min-h-[44px] flex items-center text-primary hover:text-primary/80 transition-colors">Investor Portal</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px]" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center relative z-10">
          <div>
            <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Real Estate & Investor Services
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Secure Real Estate Services for Modern Investors
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Alliance Trust Realty, powered by GEM Cybersecurity Assist, helps clients navigate property opportunities,
              financing decisions, and investor support through a secure digital operating model.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <a href="#contact">Schedule a Consultation</a>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <a href="#properties">Explore Opportunities</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="glass-panel rounded-2xl border border-border/50 p-6 bento-card">
                  <div className="inline-flex rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div>
                  <div className="mt-4 text-lg font-semibold text-foreground">{pillar.title}</div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{pillar.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-10 sm:grid-cols-2 md:grid-cols-4">
          {["Consultation-first engagement", "Real-estate-first positioning", "Mortgage and financing readiness", "Future-ready investor portal"].map((item) => (
            <div key={item} className="glass-panel rounded-xl px-5 py-4 text-sm font-medium text-muted-foreground border border-border/50">{item}</div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="About"
            title="A real-estate and investor-services division built on secure digital operations."
            text="Alliance Trust Realty delivers real-estate advisory, financing support, and investor-focused service for clients seeking a more structured way to engage property opportunities. GEM Cybersecurity Assist powers the digital backbone, operational discipline, and trust framework behind the platform."
          />
          <div className="grid gap-6">
            <div className="glass-panel rounded-2xl border border-border/50 p-6">
              <h3 className="text-xl font-semibold text-foreground">Why GEM powers the platform</h3>
              <p className="mt-3 leading-7 text-muted-foreground">GEM provides secure infrastructure, disciplined operating controls, and the systems support needed for a credible, modern client experience.</p>
            </div>
            <div className="glass-panel rounded-2xl border border-border/50 p-6">
              <h3 className="text-xl font-semibold text-foreground">Who we serve</h3>
              <p className="mt-3 leading-7 text-muted-foreground">Buyers, sellers, property investors, and clients seeking financing guidance, commercial advisory, and long-term real-estate support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured showcase */}
      <section className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading
            eyebrow="Featured Showcase"
            title="A flagship property presentation clients can trust."
            text="Spotlight a premium property opportunity with real photography, clean metrics, advisory framing, and an immediate next-step call to action."
          />
          <div className="mt-10 overflow-hidden rounded-2xl border border-border/50 glass-panel lg:grid lg:grid-cols-[1.1fr_.9fr]">
            <div className="min-h-[420px] bg-cover bg-center relative" style={{ backgroundImage: `url(${opportunities[2].image})` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent lg:bg-gradient-to-l" />
            </div>
            <div className="p-8 lg:p-10">
              <div className="inline-flex rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">Featured Residential Asset</div>
              <h3 className="mt-5 text-3xl font-bold tracking-tight text-foreground">Single-Family Rental Portfolio</h3>
              <p className="mt-4 leading-8 text-muted-foreground">A residential portfolio designed to communicate real house inventory, income potential context, and long-term planning value.</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-secondary/50 p-4"><div className="text-muted-foreground">Location</div><div className="mt-1 font-semibold text-foreground">Houston, TX</div></div>
                <div className="rounded-xl bg-secondary/50 p-4"><div className="text-muted-foreground">Asset Type</div><div className="mt-1 font-semibold text-foreground">Residential Portfolio</div></div>
                <div className="rounded-xl bg-secondary/50 p-4"><div className="text-muted-foreground">Price</div><div className="mt-1 font-semibold text-foreground">$1.80M</div></div>
                <div className="rounded-xl bg-secondary/50 p-4"><div className="text-muted-foreground">Yield Context</div><div className="mt-1 font-semibold text-foreground">6.5% cap rate</div></div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="hero" asChild>
                  <a href="#contact">Request a Review</a>
                </Button>
                <Button variant="glass" asChild>
                  <a href="#properties">See More Opportunities</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="Services" title="Real-estate guidance built for modern clients and investors." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="glass-panel rounded-2xl border border-border/50 p-6 bento-card">
                <div className="inline-flex rounded-xl bg-primary/10 p-3"><Icon className="h-5 w-5 text-primary" /></div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{service.title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">{service.summary}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">{service.bullets.map((b) => <li key={b} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{b}</li>)}</ul>
                <a href="#contact" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors min-h-[44px]">
                  Discuss This Service <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Properties */}
      <section id="properties" className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading eyebrow="Featured Opportunities" title="Property and investment-ready opportunities." text="These cards are built to feel like a real production real-estate offering: real photos, asset identity, context, and a direct path to contact." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((item) => (
              <article key={item.name} className="overflow-hidden rounded-2xl border border-border/50 glass-panel">
                <div className="relative h-72 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">{item.status}</div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.type}</div>
                    <h3 className="mt-2 text-2xl font-bold leading-tight text-foreground">{item.name}</h3>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{item.location}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-secondary/50 p-3"><div className="text-muted-foreground">Price</div><div className="mt-1 font-semibold text-foreground">{item.price}</div></div>
                    <div className="rounded-xl bg-secondary/50 p-3"><div className="text-muted-foreground">Yield Context</div><div className="mt-1 font-semibold text-foreground">{item.capRate}</div></div>
                  </div>
                  <p className="mt-5 leading-7 text-muted-foreground">{item.summary}</p>
                  <p className="mt-3 text-sm text-muted-foreground"><strong className="text-foreground">Best For:</strong> {item.bestFor}</p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="hero" size="sm" asChild>
                      <a href="#contact">Request Details</a>
                    </Button>
                    <Button variant="glass" size="sm" asChild>
                      <a href="#contact">Schedule Review</a>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory */}
      <section id="advisory" className="relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 lg:grid-cols-3 relative z-10">
          {[
            { title: "Investment Advisory", text: "Real-estate investment guidance built around property analysis, cash-flow framing, cap-rate awareness, and long-term portfolio support." },
            { title: "Mortgage Guidance", text: "Financing-readiness support for buyers, refinancers, and property investors preparing for lender conversations." },
            { title: "Investor Education", text: "Educational guidance to help clients better understand financing, property evaluation, and disciplined real-estate decisions." },
          ].map((c) => (
            <div key={c.title} className="glass-panel rounded-2xl border border-primary/20 p-8 glow-cyan bento-card">
              <h3 className="text-2xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-4 leading-7 text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why us / workflow / future */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { eyebrow: "Why us", title: "Real-estate-first, trust-led.", text: "The platform is designed to reduce noise, improve clarity, and create a stronger client journey from inquiry to engagement." },
            { eyebrow: "Workflow", title: "Consultation before complexity.", text: "We use a consultation-first model to align services, investor readiness, property needs, and financing paths." },
            { eyebrow: "Future-ready", title: "Built to grow into a platform.", text: "Alliance Trust Realty is structured to expand into secure onboarding, user access, property visibility, and investor tools." },
          ].map((c) => (
            <div key={c.title} className="glass-panel rounded-2xl border border-border/50 p-8 bento-card">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{c.eyebrow}</div>
              <h3 className="mt-4 text-2xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-4 leading-7 text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading eyebrow="Client Confidence" title="A presentation layer built for trust and conversion." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.quote} className="glass-panel rounded-2xl border border-border/50 p-8 bento-card">
                <p className="text-lg font-medium text-foreground">"{item.quote}"</p>
                <p className="mt-4 text-sm text-muted-foreground">{item.byline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Contact" title="Schedule a consultation or request information." text="Reach out for property guidance, mortgage support, investment advisory, or investor onboarding." />
            <div className="mt-8 space-y-3 text-muted-foreground">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" />support@cybersecurityassist.com</div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" />+1 (401) 702-2460</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" />Response window: 1-2 business days</div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Portal CTA */}
      <section id="portal" className="bg-secondary/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="glass-panel rounded-2xl border border-primary/20 p-8 glow-cyan">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Investor Portal</h2>
            <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
              Secure investor access, onboarding, property visibility, and future investment tracking workflows are being expanded inside the Alliance Trust Realty platform.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground border border-border/50">Secure onboarding</div>
              <div className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground border border-border/50">Property visibility</div>
              <div className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground border border-border/50">Future dashboard access</div>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <a href="/portal">Login to Portal</a>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <a href="#contact">Request Access</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="FAQ" title="Clear answers for clients and investors." />
        <div className="mt-10 grid gap-4">
          {faqs.map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* Legal */}
      <section className="bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Privacy Policy", text: "Client information is handled for service response, communication, and secure operational processing." },
            { title: "Terms of Use", text: "Site use, service inquiry behavior, and informational limitations should be governed by formal production terms." },
            { title: "Disclosures", text: "Alliance Trust Realty does not present guaranteed returns. Property and investment information should be reviewed with appropriate professional judgment." },
          ].map((c) => (
            <div key={c.title} className="glass-panel rounded-2xl border border-border/50 p-8">
              <h3 className="text-xl font-semibold text-foreground">{c.title}</h3>
              <p className="mt-4 leading-7 text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Alliance Trust Realty</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Real-estate and investor-services solutions powered by GEM Cybersecurity Assist.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Company</h4>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <a href="#about" className="hover:text-foreground transition-colors">About</a>
              <a href="#services" className="hover:text-foreground transition-colors">Services</a>
              <a href="#properties" className="hover:text-foreground transition-colors">Properties</a>
              <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Resources</h4>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <span>Privacy Policy</span>
              <span>Terms</span>
              <span>Disclosures</span>
              <span>Investor Education</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <span>support@cybersecurityassist.com</span>
              <span>+1 (401) 702-2460</span>
              <span>Powered by GEM Cybersecurity Assist</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; {new Date().getFullYear()} Alliance Trust Realty. All rights reserved.</span>
            <span>Security-backed real-estate services under GEM.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
