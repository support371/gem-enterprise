import Image from "next/image";
import Link from "next/link";
import { Shield, AlertTriangle, Globe, Eye, Zap, ArrowRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Threat Intelligence | GEM Enterprise",
  description: "Live threat intelligence, CVE advisories, dark web monitoring reports, and security bulletins from GEM Enterprise.",
};

const categories = [
  { icon: Shield, label: "Cyber Threats", color: "cyan", count: 14 },
  { icon: AlertTriangle, label: "Critical CVEs", color: "red", count: 3 },
  { icon: Eye, label: "Dark Web Alerts", color: "purple", count: 7 },
  { icon: Globe, label: "Geopolitical", color: "amber", count: 5 },
];

const featuredThreats = [
  {
    severity: "CRITICAL",
    title: "Active Exploitation of Palo Alto PAN-OS Authentication Bypass",
    summary: "CVE-2025-0108 actively exploited in the wild. Unauthenticated attackers gaining management interface access. GEM clients on affected firmware versions have been individually notified.",
    category: "Infrastructure",
    timestamp: "2 hours ago",
    affected: "Network Perimeter",
  },
  {
    severity: "HIGH",
    title: "Credential Stuffing Campaign Targeting Financial Institution Portals",
    summary: "Large-scale automated credential stuffing operation detected against major US and UK banking portals. 2.3M validated credential pairs circulating on dark web markets. Wire fraud risk elevated.",
    category: "Financial",
    timestamp: "6 hours ago",
    affected: "Financial Services",
  },
  {
    severity: "HIGH",
    title: "Real Estate Wire Fraud: Title Company Email Compromise Campaign",
    summary: "Organized BEC campaign targeting real estate title companies in California, Texas, and New York. Attacker pattern: compromise title agent email, redirect closing wire instructions 24-48 hours before close.",
    category: "Real Estate",
    timestamp: "1 day ago",
    affected: "Property Transactions",
  },
  {
    severity: "MEDIUM",
    title: "QakBot Variant with New C2 Infrastructure Detected",
    summary: "Updated QakBot variant using fast-flux DNS and TLS-encrypted C2 beaconing to evade detection. Delivered via malicious OneNote documents in targeted spear-phishing campaigns.",
    category: "Malware",
    timestamp: "2 days ago",
    affected: "Enterprise Endpoints",
  },
];

const severityColors = {
  "CRITICAL": "text-red-400 border-red-500/30 bg-red-500/10",
  "HIGH": "text-orange-400 border-orange-500/30 bg-orange-500/10",
  "MEDIUM": "text-amber-400 border-amber-500/30 bg-amber-500/10",
  "LOW": "text-green-400 border-green-500/30 bg-green-500/10",
};

export default function IntelPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        <div className="relative h-[460px]">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/fe8b6bcec_generated_image.png" alt="GEM Enterprise live threat intelligence operations room — multiple curved monitors displaying real-time cybersecurity advisories, global CVE bulletins, dark web monitoring alerts, and structured threat timelines. An analyst reviews a tablet in the foreground while wall screens update with live data feeds." fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 flex items-end pb-12">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-semibold uppercase tracking-widest">3 CRITICAL Threats Active</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-3">Threat Intelligence</h1>
              <p className="text-slate-400 text-lg max-w-2xl">Live advisories, CVE tracking, dark web monitoring, and geopolitical risk from GEM&apos;s 24/7 intelligence operations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY COUNTERS */}
      <section className="py-8 bg-white/[0.02] border-y border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const c = cat.color === "cyan" ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" : cat.color === "red" ? "text-red-400 border-red-500/20 bg-red-500/5" : cat.color === "purple" ? "text-purple-400 border-purple-500/20 bg-purple-500/5" : "text-amber-400 border-amber-500/20 bg-amber-500/5";
              return (
                <div key={i} className={`border rounded-xl p-4 flex items-center gap-4 ${c}`}>
                  <Icon className="w-6 h-6" />
                  <div>
                    <div className="text-2xl font-black">{cat.count}</div>
                    <div className="text-xs opacity-70">{cat.label}</div>
                  </div>
                </div>
              );
            )}
          </div>
        </div>
      </section>

      {/* DARK WEB MONITORING FEATURE */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden h-[380px]">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/86e283cd8_generated_image.png" alt="GEM dark web monitoring analyst in a tense dimly-lit room reviewing credential leak databases, dark web forum activity, and compromised IP address maps — representing GEM's continuous dark web surveillance operation on behalf of enterprise clients" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40" />
            <div className="absolute top-4 left-4">
              <Badge className="rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs">Dark Web Active</Badge>
            </div>
          </div>
          <div>
            <Badge className="mb-4 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs tracking-widest uppercase px-4 py-1.5">Dark Web Monitoring</Badge>
            <h2 className="text-4xl font-black text-white mb-6">Your Exposure, Found Before Attackers Act</h2>
            <p className="text-slate-400 leading-relaxed mb-5">GEM continuously monitors dark web forums, paste sites, credential markets, and breach databases — scanning specifically for your organization&apos;s domain, email patterns, credential pairs, and sensitive data signatures.</p>
            <p className="text-slate-400 leading-relaxed mb-6">When a match is found, you receive an immediate alert with context: what was exposed, where it appeared, and what action to take — before attackers can weaponize it.</p>
            <Link href="/products/cyber" className="inline-flex items-center gap-2 text-purple-400 font-semibold hover:gap-3 transition-all">
              Learn About Cyber Fund <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED THREATS */}
      <section className="py-24 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Active Threat Advisories</h2>
              <p className="text-slate-400">Updated continuously by GEM intelligence analysts</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-sm font-semibold">Live Feed</span>
            </div>
          </div>
          <div className="space-y-4">
            {featuredThreats.map((threat, i) => (
              <div key={i} className="bg-background/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge className={`rounded-full border text-xs font-bold ${severityColors[threat.severity as keyof typeof severityColors]}`}>
                    ⚠ {threat.severity}
                  </Badge>
                  <Badge className="rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs">{threat.category}</Badge>
                  <span className="text-slate-500 text-xs ml-auto">{threat.timestamp}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{threat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{threat.summary}</p>
                <div className="text-xs text-slate-500">Affected: {threat.affected}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm mb-4">Full intelligence feed — authenticated client access only</p>
            <Link href="/get-started" className="inline-flex items-center gap-2 text-cyan-400 font-semibold hover:gap-3 transition-all">
              Request Portal Access <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
