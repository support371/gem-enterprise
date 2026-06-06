import Link from "next/link";
import Image from "next/image";
import { Shield, Eye, Zap, Globe, Lock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "GEM Cyber Fund | Institutional Cybersecurity Operations",
  description: "Threat intelligence, dark web monitoring, 24/7 SOC coverage, and rapid incident response engineered for enterprise clients.",
};

const capabilities = [
  { icon: Shield, title: "24/7 Security Operations Center", desc: "Certified analysts on a follow-the-sun model across North America, EMEA, and Asia-Pacific. Sub-6-minute MTTA. Zero coverage gaps.", tags: ["SIEM Management", "Log Correlation", "Real-Time Alerts"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png", imgAlt: "GEM Enterprise Security Operations Center — certified analysts at curved 6-monitor workstations monitoring live SIEM dashboards, global attack maps and threat feeds around the clock" },
  { icon: Eye, title: "Proactive Threat Hunting", desc: "Intelligence-led hunting informed by current adversary TTPs. Hypothesis-driven workflows that find attackers before they cause damage.", tags: ["Behavioral Analytics", "Dark Web", "TTP Detection"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/86e283cd8_generated_image.png", imgAlt: "GEM dark web threat hunting analyst in a dim room illuminated by monitor glow, reviewing credential leak databases and dark web forum activity on behalf of enterprise clients" },
  { icon: Zap, title: "Incident Response", desc: "Guaranteed 4-hour activation SLA. Rapid containment, eradication, and recovery with full digital forensics and post-incident reporting.", tags: ["4hr SLA", "Digital Forensics", "Evidence Preservation"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c974a8817_generated_image.png", imgAlt: "GEM incident response war room — 8 cybersecurity analysts at circular workstation formation with large wall screens showing live attack timeline, affected systems heatmap and network anomaly graphs during a cyber crisis" },
  { icon: Globe, title: "Dark Web Monitoring", desc: "Continuous surveillance of dark web forums, paste sites, credential markets, and breach databases for your exposed data.", tags: ["Credential Leaks", "IP Monitoring", "Breach Alerts"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/86e283cd8_generated_image.png", imgAlt: "GEM Enterprise dark web surveillance station — real-time monitoring of credential markets, paste sites and breach databases with global threat mapping" },
  { icon: Lock, title: "Red Team Operations", desc: "Full-scope adversarial simulations — network penetration, web application testing, social engineering, and physical security.", tags: ["Pentest", "Social Engineering", "Kill Chain Simulation"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/ca12688fe_generated_image.png", imgAlt: "GEM red team penetration tester at dual-monitor workstation running vulnerability scanner showing color-coded risk ratings and terminal exploit commands — professional offensive security setup" },
  { icon: Users, title: "Compliance & Regulatory", desc: "Expert guidance across SOC 2, ISO 27001, NIST CSF, GDPR, HIPAA, CMMC, and sector-specific mandates.", tags: ["SOC 2", "ISO 27001", "NIST CSF"], img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png", imgAlt: "GEM Enterprise compliance officer at executive desk reviewing multi-screen SOC 2 Type II, ISO 27001, NIST CSF and HIPAA compliance dashboard with green and amber status indicators" },
];

export default function GEMCyberFundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
      <section className="relative min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png" alt="GEM Enterprise Security Operations Center — the 24/7 global threat monitoring nerve center powering the GEM Cyber Fund institutional cybersecurity service" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>
        <div className="relative z-10 container mx-auto px-6 max-w-7xl pb-20">
          <Badge className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">GEM Cyber Fund</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 max-w-4xl leading-tight">
            Institutional-Grade<br /><span className="text-cyan-400">Cybersecurity Operations</span>
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl leading-relaxed mb-8">Threat intelligence, dark web monitoring, 24/7 SOC, and rapid incident response — engineered for organizations that cannot afford to be wrong.</p>
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

      {/* ── STATS ── */}
      <section className="py-12 bg-white/[0.02] border-y border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{v:"< 6 min",l:"Mean Time to Acknowledge"},{v:"4 hr",l:"Incident Response SLA"},{v:"24/7",l:"SOC Coverage"},{v:"500+",l:"Enterprise Clients"}].map((s,i)=>(
              <div key={i} className="bg-background/60 border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-black text-cyan-400 mb-2">{s.v}</div>
                <div className="text-slate-400 text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES — image cards ── */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">Six Core Capabilities</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Each capability is staffed, tooled, and audited to enterprise standards. Together they form a complete institutional security wrapper.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className="bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all group">
                <div className="relative h-48">
                  <Image src={cap.img} alt={cap.imgAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3">{cap.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{cap.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {cap.tags.map(t => <span key={t} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-3 py-0.5">{t}</span>)}
                  </div>
                </div>
              </div>
            );
          )}
        </div>
      </section>

      {/* ── DARK WEB FEATURE SPLIT ── */}
      <section className="py-0 overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-[400px] lg:h-auto">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/86e283cd8_generated_image.png" alt="GEM dark web monitoring — lone analyst in a dark room reviewing credential leak databases, paste sites and compromised IP address maps on behalf of enterprise clients. Cyan and red monitor glow illuminates their focused work." fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60 lg:bg-gradient-to-r" />
          </div>
          <div className="bg-white/[0.02] border-l border-white/10 p-12 lg:p-16 flex flex-col justify-center">
            <Badge className="mb-4 self-start rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs tracking-widest uppercase px-4 py-1.5">Dark Web Intelligence</Badge>
            <h2 className="text-4xl font-black text-white mb-6">Your Exposure Found Before Attackers Act</h2>
            <p className="text-slate-400 leading-relaxed mb-5">GEM continuously monitors dark web forums, paste sites, credential markets, and breach databases — scanning specifically for your organization&apos;s domain, email patterns, credential pairs, and sensitive data signatures.</p>
            <p className="text-slate-400 leading-relaxed mb-6">When a match is found, you receive an immediate alert with context: what was exposed, where it appeared, and what action to take — before attackers can weaponize it.</p>
            <div className="grid grid-cols-2 gap-4">
              {["24/7 Forum Scanning","Credential Market Watch","Breach DB Correlation","Instant Alert Delivery"].map(item => (
                <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INCIDENT RESPONSE SPLIT ── */}
      <section className="py-0 overflow-hidden border-t border-white/10">
        <div className="grid lg:grid-cols-2">
          <div className="bg-white/[0.02] p-12 lg:p-16 flex flex-col justify-center">
            <Badge className="mb-4 self-start rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs tracking-widest uppercase px-4 py-1.5">Incident Response</Badge>
            <h2 className="text-4xl font-black text-white mb-6">4-Hour Activation. Immediate Containment.</h2>
            <p className="text-slate-400 leading-relaxed mb-5">When an incident occurs, minutes matter. GEM&apos;s incident response team activates within 4 hours of notification — deploying trained responders with full forensic capabilities to your environment.</p>
            <p className="text-slate-400 leading-relaxed mb-6">Every response follows a documented kill-chain containment methodology — isolating threats, preserving evidence for legal proceedings, and restoring operations with minimal downtime.</p>
            <Link href="/request-access" className="self-start inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm">
              Activate IR Coverage
            </Link>
          </div>
          <div className="relative h-[400px] lg:h-auto">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c974a8817_generated_image.png" alt="GEM Enterprise incident response war room in action — 8 security analysts at a circular workstation formation, large wall screens showing live attack timeline, affected systems heatmap and network traffic anomaly graphs under emergency lighting" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/60 lg:bg-gradient-to-l" />
          </div>
        </div>
      </section>

      {/* ── RED TEAM SPLIT ── */}
      <section className="py-0 overflow-hidden border-t border-white/10">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-[400px] lg:h-auto">
            <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/ca12688fe_generated_image.png" alt="GEM red team professional at dual-monitor workstation running a network vulnerability scanner with color-coded risk ratings and terminal exploit commands — professional offensive security penetration testing setup" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60" />
          </div>
          <div className="bg-white/[0.02] border-l border-white/10 p-12 lg:p-16 flex flex-col justify-center">
            <Badge className="mb-4 self-start rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs tracking-widest uppercase px-4 py-1.5">Red Team Operations</Badge>
            <h2 className="text-4xl font-black text-white mb-6">Think Like Your Adversary</h2>
            <p className="text-slate-400 leading-relaxed mb-5">GEM&apos;s red team conducts full-scope adversarial simulations using the same tools, techniques, and procedures used by nation-state actors and advanced criminal organizations.</p>
            <p className="text-slate-400 leading-relaxed mb-5">Every engagement delivers a board-level executive brief, a technical remediation roadmap, and validated re-test credits to confirm that identified vulnerabilities have been resolved.</p>
            <Link href="/request-access" className="self-start inline-flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 font-semibold px-6 py-3 rounded-full transition-all text-sm">
              Request Red Team Engagement
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center container mx-auto px-6">
        <h2 className="text-5xl font-black text-white mb-6">Ready to Activate Cyber Fund Coverage?</h2>
        <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">Qualified clients only. Begin your eligibility review today.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-10">
            <Link href="/request-access">Apply for Access</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold rounded-full px-10">
            <Link href="/contact">Talk to a Specialist</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
