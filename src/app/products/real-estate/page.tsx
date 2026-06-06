import Link from "next/link";
import Image from "next/image";
import { Shield, Building2, Eye, Lock, Globe, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "ATR Property Trust | Real Estate Intelligence & Portfolio Security | GEM Enterprise",
  description: "Title security, property fraud prevention, deed monitoring, REIT-style portfolio visibility, and secured real estate asset management.",
};

const capabilities = [
  { icon: Shield, title: "Title Security & Verification", desc: "Comprehensive chain-of-title analysis and ongoing integrity monitoring. Detect unauthorized modifications, fraudulent liens, and title manipulation before financial loss.", tags: ["Title Chain", "Lien Monitoring", "Encumbrance Detection"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/19e5f907b_generated_image.png", imgAlt: "GEM ATR Property Trust title security — senior real estate attorney at warm wood desk reviewing property title chain visualization on a large monitor with ownership nodes connected by verified green checkmarks" },
  { icon: Building2, title: "Property Fraud Prevention", desc: "Active monitoring for deed fraud, identity theft targeting property owners, and unauthorized transfer attempts. 24/7 surveillance across all covered properties.", tags: ["Deed Fraud", "Owner Verification", "Transfer Alerts"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1f7e5fb1b_generated_image.png", imgAlt: "GEM ATR Property Trust — luxury commercial real estate tower at dusk with subtle digital property protection overlay, representing active deed and title fraud prevention monitoring" },
  { icon: Eye, title: "Deed Change Monitoring", desc: "Automated monitoring of county recorder databases and public land records. Instant notification on new recordings, reconveyances, and court filings on covered properties.", tags: ["County Recorder", "24/7 Alerts", "Portfolio Coverage"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/fe8b6bcec_generated_image.png", imgAlt: "GEM ATR Property Trust deed change monitoring — analyst reviewing live property record feeds across multiple monitors showing county recorder data, deed change alerts and portfolio coverage status" },
  { icon: Lock, title: "Escrow & Closing Protection", desc: "Security protocols protecting real estate closings from wire fraud, BEC attacks, and identity impersonation. Pre-closing verification of all parties and wire instruction authentication.", tags: ["Wire Verification", "BEC Protection", "Identity Confirm"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c0b3cf9af_generated_image.png", imgAlt: "GEM ATR escrow and closing protection — institutional vault representing the secure document and wire instruction verification system protecting high-value real estate closings" },
  { icon: BarChart2, title: "REIT-Style Portfolio Intelligence", desc: "Institutional portfolio visibility across all covered properties — ownership records, encumbrances, valuations, and risk ratings in one authenticated dashboard.", tags: ["Portfolio Dashboard", "Risk Rating", "Valuation Data"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f1610090d_generated_image.png", imgAlt: "GEM ATR REIT-style portfolio intelligence — institutional meeting room with large portfolio dashboard showing property holdings, risk ratings and valuation data across a managed real estate portfolio" },
  { icon: Globe, title: "Trust Workflow Management", desc: "Structured workflows for trust-held real estate — trust agreement validation, trustee authority verification, beneficial interest documentation, and compliance records.", tags: ["Trust Agreements", "Trustee Auth", "Beneficial Interest"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png", imgAlt: "GEM ATR trust workflow management — compliance officer reviewing trust agreement documentation and beneficial ownership records for institutional real estate holdings" },
];

export default function ATRPropertyTrustPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1f7e5fb1b_generated_image.png" alt="ATR Property Trust hero — stunning modern luxury residential tower and commercial office complex photographed at dusk, warm interior lights glowing through floor-to-ceiling windows with city lights in background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>
        <div className="relative z-10 container mx-auto px-6 max-w-7xl pb-20">
          <Badge className="mb-6 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs tracking-widest uppercase px-4 py-1.5">ATR Property Trust</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 max-w-4xl leading-tight">
            Real Estate Intelligence,<br /><span className="text-amber-400">Trust Workflows &amp; Portfolio Security</span>
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl leading-relaxed mb-4">Title security, property fraud prevention, deed monitoring, and REIT-style portfolio visibility — powered by Alliance Trust Realty and GEM Enterprise.</p>
          <p className="text-slate-400 text-sm mb-8">US EIN: 39-3307036 &nbsp;|&nbsp; UK Companies House: SC001731 &nbsp;|&nbsp; 444 Alaska Ave, Torrance, CA 90503</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-amber-400 text-black hover:bg-amber-500 font-semibold rounded-full px-8">
              <Link href="/request-access">Request Access</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-8">
              <Link href="/atr">Explore ATR</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TITLE SECURITY FEATURE */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden h-[420px]">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/19e5f907b_generated_image.png" alt="GEM ATR Property Trust title security and deed verification — senior real estate attorney at a warm mahogany desk reviewing a property title chain visualization showing ownership history nodes connected by verified checkmarks, with leather-bound files stacked nearby and a subtle American flag visible in the background" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
          <div>
            <Badge className="mb-4 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs tracking-widest uppercase px-4 py-1.5">Title Security</Badge>
            <h2 className="text-4xl font-black text-white mb-6">Your Title Chain, Verified and Continuously Monitored</h2>
            <p className="text-slate-400 leading-relaxed mb-5">Property fraud and deed theft are among the fastest-growing financial crimes. GEM ATR&apos;s title security service delivers comprehensive chain-of-title analysis and ongoing integrity monitoring — detecting unauthorized modifications, fraudulent liens, and title manipulation before they cause financial loss.</p>
            <p className="text-slate-400 leading-relaxed mb-6">Every covered property receives automated monitoring of county recorder databases, instant deed-change alerts, and a dedicated property intelligence analyst tracking your portfolio.</p>
            <div className="grid grid-cols-2 gap-3">
              {["Chain-of-Title Analysis","24/7 Recorder Monitoring","Instant Deed Alerts","Fraudulent Lien Detection","Cross-Jurisdiction Coverage","Legal-Grade Documentation"].map(item => (
                <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FRAUD STATS */}
      <section className="py-24 bg-white/[0.02] border-y border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">The Real Estate Fraud Threat Is Growing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">Property fraud, deed theft, wire fraud at closing, and title manipulation are among the fastest-growing financial crimes targeting high-value real estate.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[{v:"$446M+",l:"Lost to real estate wire fraud in the US — FBI IC3 2024"},{v:"85%",l:"Of title fraud victims had no active deed monitoring in place"},{v:"48 hrs",l:"Average window for fraudulent deed transfer to be recorded before discovery"}].map((s,i)=>(
              <div key={i} className="bg-background/60 border border-white/10 rounded-xl p-8 text-center">
                <div className="text-4xl font-black text-amber-400 mb-3">{s.v}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{s.l}</div>
              </div>
            ))}
          </div>
          {/* Fraud visual */}
          <div className="relative rounded-2xl overflow-hidden h-72">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1f7e5fb1b_generated_image.png" alt="ATR Property Trust — protecting high-value real estate portfolios from deed fraud, wire fraud and title theft across US and UK jurisdictions" fill className="object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-8">
                <h3 className="text-3xl font-black text-white mb-3">Every Property. Every Day. Monitored.</h3>
                <p className="text-slate-300 max-w-xl">GEM ATR monitors your entire portfolio automatically — alerting you the moment any unauthorized activity is recorded against your properties.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES GRID */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <h2 className="text-4xl font-black text-white text-center mb-16">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className="bg-white/[0.02] border border-white/10 hover:border-amber-500/30 rounded-2xl overflow-hidden transition-all group">
                <div className="relative h-44">
                  <Image src={cap.img} alt={cap.imgAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{cap.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {cap.tags.map(t => <span key={t} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-3 py-0.5">{t}</span>)}
                  </div>
                </div>
              </div>
            );
          }}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-black text-white mb-6">Secure Your Real Estate Portfolio with ATR</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">Qualified real estate investors, family offices, and institutional operators. Begin your eligibility review today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-amber-400 text-black hover:bg-amber-500 font-semibold rounded-full px-10">
              <Link href="/request-access">Apply for Access</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-10">
              <Link href="/contact">Talk to a Specialist</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
