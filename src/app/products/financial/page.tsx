import Link from "next/link";
import { Shield, BarChart2, Lock, Eye, Globe, Users } from "lucide-react";

export const metadata = {
  title: "Financial Shield | Asset Protection & Wealth Security | GEM Enterprise",
  description: "Asset protection workflows, wealth preservation structures, secure escrow coordination, and institutional vault operations for qualified clients.",
};

const capabilities = [
  { icon: BarChart2, title: "Secure Transaction Monitoring", desc: "Real-time surveillance of financial transactions across banking, trading, and payment infrastructure. Anomaly detection, threshold alerting, and full audit trail generation.", tags: ["Real-Time Analysis", "Anomaly Detection", "Audit Trail"] },
  { icon: Shield, title: "Fraud Prevention & Detection", desc: "Multi-layer fraud prevention combining behavioral biometrics, identity verification, and ML-assisted pattern recognition. Protects against account takeover, wire fraud, and insider threats.", tags: ["Wire Fraud", "ATO Prevention", "Insider Threat"] },
  { icon: Eye, title: "AML Compliance Support", desc: "KYC/AML program design, suspicious activity monitoring, SAR preparation, and regulatory filing guidance for financial institutions and qualified entities.", tags: ["KYC/AML", "SAR Preparation", "Risk Scoring"] },
  { icon: Lock, title: "Financial Forensics", desc: "Forensic investigation of fraud, embezzlement, and asset misappropriation. Legally defensible findings for litigation, arbitration, and regulatory proceedings.", tags: ["Asset Tracing", "Expert Witness", "Litigation-Ready"] },
  { icon: Globe, title: "Institutional Vault Operations", desc: "Secure digital vault infrastructure for critical financial documents, ownership records, legal agreements, and compliance evidence — encrypted and audit-logged.", tags: ["Encrypted Storage", "Access Control", "Document Vault"] },
  { icon: Users, title: "Wealth Preservation Structures", desc: "Advisory support for trust frameworks, multi-jurisdictional compliance alignment, and coordinated escrow operations for high-value transactions.", tags: ["Trust Structures", "Escrow", "Multi-Jurisdiction"] },
];

export default function FinancialShieldPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pt-20">
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://media.base44.com/images/public/69d42975b7b1794c3dc01661/e50d238c1_generated_image.png)`, opacity: 0.22 }} aria-hidden="true" />
        <span className="sr-only">Hero: Modern glass skyscraper at dusk reflected in water with digital security network overlay and glowing protection shield — representing GEM Financial Shield institutional asset protection and wealth security operations</span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/95 via-[#0a0e1a]/80 to-[#0a0e1a]/30" />
        <div className="relative container mx-auto px-4 py-20 z-10 max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6"><Shield className="w-3.5 h-3.5 text-cyan-400" /><span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Financial Shield</span></div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">Institutional Asset Protection<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">&amp; Wealth Preservation</span></h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">Asset protection workflows, wealth preservation structures, secure escrow coordination, and institutional vault operations — designed for qualified individuals, family offices, and enterprise clients.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/request-access" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition-all text-white">Request Access</Link>
              <Link href="/services" className="px-8 py-4 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-semibold transition-all">View All Services</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">What Is Financial Shield?</h2>
            <p className="text-slate-400 leading-relaxed mb-5">GEM Financial Shield is a comprehensive asset protection and financial security service for qualified clients — including accredited investors, family offices, corporate treasuries, and institutional entities.</p>
            <p className="text-slate-400 leading-relaxed mb-5">Unlike traditional financial advisors, GEM operates at the intersection of cybersecurity and financial risk — protecting not just the legal structures around your assets, but the digital and operational pathways through which those assets move.</p>
            <p className="text-slate-400 leading-relaxed">Every Financial Shield client receives a dedicated financial security analyst, a secure vault for critical documentation, and real-time alerting on anomalous activity across all monitored accounts.</p>
          </div>
          <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl aspect-video flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/15 border-2 border-cyan-500 flex items-center justify-center"><div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[20px] border-l-cyan-400 ml-1" /></div>
            <div className="text-center px-8"><p className="text-white font-semibold mb-1">Video: Financial Shield Overview</p><p className="text-slate-500 text-sm">2-minute introduction to GEM&apos;s asset protection and wealth security. <span className="text-slate-600">[To be recorded and embedded here by GEM financial team]</span></p></div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900/30 border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-16">Core Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => { const Icon = cap.icon; return (
              <div key={i} className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 rounded-xl p-7 transition-all">
                <Icon className="w-8 h-8 text-cyan-500 mb-4" /><h3 className="text-lg font-bold mb-3">{cap.title}</h3><p className="text-slate-400 text-sm leading-relaxed mb-4">{cap.desc}</p>
                <div className="flex flex-wrap gap-2">{cap.tags.map(t => <span key={t} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded px-2 py-0.5">{t}</span>)}</div>
              </div>
            ); }}
          </div>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl font-bold text-center mb-16">Who Financial Shield Is For</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{t:"Accredited Investors",d:"High-net-worth individuals requiring asset protection, fraud monitoring, and secure transaction oversight."},{t:"Family Offices",d:"Single and multi-family offices managing complex multi-asset portfolios across multiple jurisdictions."},{t:"Corporate Treasuries",d:"Enterprise finance teams requiring real-time monitoring of outbound payments and counterparty risk."},{t:"Fund Managers",d:"Investment advisors and fund managers under regulatory obligations requiring AML, KYC, and compliance oversight."}].map((c,i)=>(
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6"><div className="w-8 h-1 bg-cyan-500 rounded mb-4"/><h3 className="font-bold mb-3">{c.t}</h3><p className="text-slate-400 text-sm leading-relaxed">{c.d}</p></div>
          ))}
        </div>
      </section>

      <section className="py-24 text-center bg-slate-900/30 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Protect Your Financial Assets with GEM</h2>
          <p className="text-slate-400 mb-10 max-w-lg mx-auto">Begin your eligibility review today. Financial Shield is available to qualified clients only.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/request-access" className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition-all text-white">Apply for Access</Link>
            <Link href="/contact" className="px-10 py-4 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-semibold transition-all">Talk to a Specialist</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
