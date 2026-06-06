import Link from "next/link";
import Image from "next/image";
import { Shield, BarChart2, Lock, Eye, Globe, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Financial Shield | Asset Protection & Wealth Security | GEM Enterprise",
  description: "Asset protection workflows, wealth preservation structures, secure escrow coordination, and institutional vault operations.",
};

const capabilities = [
  { icon: BarChart2, title: "Secure Transaction Monitoring", desc: "Real-time surveillance across banking, trading, and payment infrastructure. Anomaly detection, threshold alerting, and full audit trail generation.", tags: ["Real-Time Analysis", "Anomaly Detection", "Audit Trail"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f1610090d_generated_image.png", imgAlt: "GEM Financial Shield — institutional wealth management meeting with portfolio allocation screen showing cyan and gold asset distribution, floor-to-ceiling windows overlooking financial district at dusk" },
  { icon: Shield, title: "Fraud Prevention & Detection", desc: "Multi-layer fraud prevention combining behavioral biometrics, identity verification, and ML-assisted pattern recognition against account takeover, wire fraud, and insider threats.", tags: ["Wire Fraud", "ATO Prevention", "Insider Threat"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png", imgAlt: "GEM financial fraud detection compliance analyst reviewing multi-screen fraud monitoring dashboard with transaction anomaly indicators and suspicious activity flagging" },
  { icon: Eye, title: "AML Compliance Support", desc: "KYC/AML program design, suspicious activity monitoring, SAR preparation, and regulatory filing guidance for financial institutions and qualified entities.", tags: ["KYC/AML", "SAR Preparation", "Risk Scoring"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f42ed0ce5_generated_image.png", imgAlt: "GEM Enterprise KYC and AML compliance workflow — professional woman holding identity document toward verification camera in bright modern office, representing GEM Financial Shield KYC onboarding process" },
  { icon: Lock, title: "Financial Forensics", desc: "Forensic investigation of fraud, embezzlement, and asset misappropriation. Legally defensible findings for litigation, arbitration, and regulatory proceedings.", tags: ["Asset Tracing", "Expert Witness", "Litigation-Ready"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/fe8b6bcec_generated_image.png", imgAlt: "GEM financial forensics investigation room — analysts reviewing transaction records, evidence timelines and financial pattern analysis across multiple curved monitors" },
  { icon: Globe, title: "Institutional Vault Operations", desc: "Secure digital vault for critical financial documents, ownership records, legal agreements, and compliance evidence — encrypted, access-controlled, and audit-logged.", tags: ["Encrypted Storage", "Access Control", "Document Vault"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c0b3cf9af_generated_image.png", imgAlt: "GEM Enterprise institutional digital vault room — sleek dark server environment with holographic vault door and cyan biometric security interface, representing secure document and asset storage" },
  { icon: Users, title: "Wealth Preservation Structures", desc: "Advisory support for trust frameworks, multi-jurisdictional compliance, and coordinated escrow operations for high-value transactions.", tags: ["Trust Structures", "Escrow", "Multi-Jurisdiction"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/9b9d1f784_generated_image.png", imgAlt: "GEM Financial Shield institutional wealth preservation — modern glass skyscraper at golden hour with digital security shield overlay, representing institutional asset protection and escrow coordination" },
];

export default function FinancialShieldPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/9b9d1f784_generated_image.png" alt="GEM Financial Shield hero — modern glass and steel financial district skyscrapers at golden hour with digital security network overlay, representing institutional asset protection and wealth preservation for qualified clients" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>
        <div className="relative z-10 container mx-auto px-6 max-w-7xl pb-20">
          <Badge className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">Financial Shield</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 max-w-4xl leading-tight">
            Institutional Asset Protection<br /><span className="text-cyan-400">&amp; Wealth Preservation</span>
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl leading-relaxed mb-8">Asset protection workflows, wealth preservation structures, secure escrow coordination, and institutional vault operations — for qualified individuals, family offices, and enterprise clients.</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-8">
              <Link href="/request-access">Request Access</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-8">
              <Link href="/services">All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WEALTH MEETING FEATURE */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">What Is Financial Shield?</Badge>
            <h2 className="text-4xl font-black text-white mb-6">The Same Protection Reserved for the World&apos;s Largest Institutions</h2>
            <p className="text-slate-400 leading-relaxed mb-5">GEM Financial Shield delivers comprehensive asset protection and financial security for qualified clients — including accredited investors, family offices, corporate treasuries, and institutional entities.</p>
            <p className="text-slate-400 leading-relaxed mb-5">Unlike traditional financial advisors, GEM operates at the intersection of cybersecurity and financial risk — protecting not just the legal structures around your assets, but the digital and operational pathways through which those assets move.</p>
            <p className="text-slate-400 leading-relaxed">Every Financial Shield client receives a dedicated financial security analyst, a secure vault for critical documentation, and real-time alerting on anomalous activity across all monitored accounts.</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-[420px]">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f1610090d_generated_image.png" alt="GEM Financial Shield wealth preservation meeting — two senior advisors in a premium conference room reviewing a portfolio allocation chart on a large wall screen with cyan and gold color scheme, floor-to-ceiling windows overlooking financial district at dusk" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* VAULT SECTION */}
      <section className="relative overflow-hidden border-y border-white/10">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-[420px] lg:h-auto">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c0b3cf9af_generated_image.png" alt="GEM Enterprise institutional digital vault — sleek dark server room with holographic transparent vault door glowing cyan, biometric scanner panel, and reflective polished floor. Representing secure storage for critical financial documents, ownership records and compliance evidence." fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40" />
          </div>
          <div className="bg-white/[0.02] p-12 lg:p-16 flex flex-col justify-center">
            <Badge className="mb-4 self-start rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">Vault Operations</Badge>
            <h2 className="text-4xl font-black text-white mb-6">Institutional-Grade Document Security</h2>
            <p className="text-slate-400 leading-relaxed mb-5">Every Financial Shield engagement includes access to GEM&apos;s encrypted institutional vault — a secure digital repository for your most critical financial documents, legal agreements, ownership records, and compliance evidence.</p>
            <p className="text-slate-400 leading-relaxed mb-6">Access is role-controlled, fully audit-logged, and protected by multi-factor authentication and hardware key support. Every access event is time-stamped and immutable.</p>
            <div className="grid grid-cols-2 gap-3">
              {["AES-256 Encryption","Role-Based Access","Immutable Audit Log","Multi-Factor Auth","Legal-Grade Integrity","Cross-Jurisdiction"].map(item => (
                <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />{item}
                </div>
              ))}
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
              <div key={i} className="bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all group">
                <div className="relative h-44">
                  <Image src={cap.img} alt={cap.imgAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{cap.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {cap.tags.map(t => <span key={t} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-3 py-0.5">{t}</span>)}
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
          <h2 className="text-4xl font-black text-white mb-6">Protect Your Financial Assets with GEM</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">Financial Shield is available to qualified clients only. Begin your eligibility review today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-10">
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
