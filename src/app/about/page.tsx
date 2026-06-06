import Image from "next/image";
import Link from "next/link";
import { Shield, Users, Globe, Award, ArrowRight, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About GEM Enterprise | Defend. Protect. Prevail.",
  description: "GEM Enterprise is an institutional cybersecurity, financial security, and real estate protection firm serving qualified clients globally.",
};

const values = [
  { title: "Institutional Integrity", desc: "Every client relationship is governed by strict access controls, compliance review, and documented entitlement — no exceptions." },
  { title: "Operational Excellence", desc: "We hold ourselves to the same standards we enforce for our clients. Sub-6-minute MTTA, 4-hour IR SLA, zero-surprise operations." },
  { title: "Proactive Intelligence", desc: "We hunt threats, monitor dark web exposure, and generate actionable intelligence before incidents occur — not after." },
  { title: "Client Confidentiality", desc: "All engagements operate under NDA, strict data compartmentalization, and role-based access. Client information is never shared." },
];

const credentials = [
  "SOC 2 Type II compliant operations",
  "ISO 27001 certified analysts",
  "NIST CSF framework alignment",
  "CMMC 2.0 Level 2 advisory capability",
  "US-registered entity (EIN: 39-3307036)",
  "UK Companies House registered (SC001731)",
  "24/7 follow-the-sun SOC coverage",
  "4-hour incident response SLA",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        <div className="relative h-[500px] w-full">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1756905aa_generated_image.png" alt="GEM Enterprise leadership team — four senior cybersecurity and financial security professionals gathered around a large interactive screen in a modern glass-walled conference room reviewing a live threat intelligence briefing. The team represents decades of experience across enterprise security, regulatory compliance, and high-value asset protection." fill className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
          <div className="absolute inset-0 flex items-end pb-16">
            <div className="container mx-auto px-6 max-w-7xl">
              <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">About GEM Enterprise</Badge>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4">Built by Operators,<br />For Operators.</h1>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black text-white mb-6">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed text-lg mb-6">GEM Enterprise was founded on a single conviction: qualified individuals, family offices, and institutional operators deserve the same security capabilities that have historically been available only to the largest enterprises and government agencies.</p>
            <p className="text-slate-400 leading-relaxed mb-6">We built GEM because we couldn&apos;t find a platform that combined institutional-grade cybersecurity, financial asset protection, and real estate security intelligence in a single, compliance-governed framework.</p>
            <p className="text-slate-400 leading-relaxed">Every GEM engagement is invitation and application-based. Access is gated by KYC verification, entity review, and entitlement approval — because the quality of our work depends on the quality of our client relationships.</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-[380px]">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png" alt="GEM Enterprise Security Operations Center showing real-time threat monitoring infrastructure — the operational backbone of GEM's 24/7 security intelligence platform" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-background/80 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Live Operations</span>
                </div>
                <p className="text-white text-sm font-semibold">SOC Monitoring Active — All Systems Nominal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 bg-white/[0.02] border-y border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-4xl font-black text-white text-center mb-16">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-background/60 border border-white/10 rounded-xl p-6 hover:border-cyan-500/20 transition-all">
                <div className="w-10 h-1 bg-cyan-500 rounded mb-4" />
                <h3 className="font-bold text-white mb-3">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLIANCE IMAGE SECTION */}
      <section className="relative overflow-hidden">
        <div className="relative h-[400px]">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png" alt="GEM Enterprise compliance operations — a senior compliance officer reviews a multi-monitor SOC 2, ISO 27001, NIST CSF, and HIPAA compliance dashboard with green and amber indicators. Framed compliance certificates visible on the office wall behind them." fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/10" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="max-w-xl">
                <h2 className="text-4xl font-black text-white mb-6">Credentials & Compliance</h2>
                <div className="grid grid-cols-1 gap-3">
                  {credentials.slice(0,6).map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-300 text-sm">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center container mx-auto px-6">
        <h2 className="text-4xl font-black text-white mb-6">Work With GEM Enterprise</h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Applications are reviewed on a rolling basis. Qualified clients receive a response within 48 business hours.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-10">
            <Link href="/get-started">Begin Application <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-10">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
