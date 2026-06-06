import Link from "next/link";
import Image from "next/image";
import { Shield, Zap, Lock, Eye, Building2, ArrowRight, Globe, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Services | GEM Enterprise",
  description: "Institutional-grade cybersecurity, financial security, and real estate protection services for qualified clients.",
};

const services = [
  {
    icon: Shield,
    title: "24/7 Threat Monitoring & SOC",
    slug: "threat-monitoring",
    desc: "Continuous AI-powered surveillance with certified analysts operating on a follow-the-sun model. Sub-6-minute mean time to acknowledge (MTTA) with zero coverage gaps across North America, EMEA, and APAC.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png",
    imgAlt: "GEM Enterprise Security Operations Center — analysts at curved 6-monitor workstations monitoring live SIEM dashboards, global attack maps, and threat feeds around the clock",
    tags: ["SIEM", "Log Correlation", "Real-Time Alerts"],
    tier: "Enterprise",
    color: "cyan",
  },
  {
    icon: Zap,
    title: "Incident Response",
    slug: "incident-response",
    desc: "Guaranteed 4-hour activation SLA. Rapid containment, eradication, and recovery. Full digital forensics, chain-of-custody evidence management, and post-incident executive briefing.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c974a8817_generated_image.png",
    imgAlt: "GEM incident response war room — 8 cybersecurity analysts at circular workstation formation with large wall screens showing attack timeline, affected systems heatmap, and live network anomaly graphs",
    tags: ["4hr SLA", "Digital Forensics", "Evidence Preservation"],
    tier: "All Tiers",
    color: "red",
  },
  {
    icon: Eye,
    title: "Dark Web Monitoring",
    slug: "dark-web",
    desc: "Continuous surveillance of dark web forums, paste sites, credential markets, and breach databases. Instant alerts on exposed credentials, IP ranges, and organizational data.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/86e283cd8_generated_image.png",
    imgAlt: "GEM dark web monitoring analyst in a dark room illuminated only by monitor glow, reviewing credential leak databases and dark web forum activity on behalf of enterprise clients",
    tags: ["Credential Leaks", "IP Monitoring", "Breach Alerts"],
    tier: "Enterprise",
    color: "purple",
  },
  {
    icon: Lock,
    title: "Red Team & Penetration Testing",
    slug: "red-team",
    desc: "Full-scope adversarial simulations covering network penetration, web application security, social engineering, and physical security. Board-level debrief and remediation roadmap included.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/ca12688fe_generated_image.png",
    imgAlt: "GEM red team penetration tester at dual-monitor workstation running vulnerability scanner with color-coded risk ratings and terminal commands — professional offensive security setup",
    tags: ["Pentest", "Social Engineering", "Kill Chain Simulation"],
    tier: "Enterprise",
    color: "orange",
  },
  {
    icon: Building2,
    title: "Asset Recovery & Physical Security",
    slug: "asset-recovery",
    desc: "High-value physical and digital asset protection and global recovery operations. Coordinated with Alliance Trust Realty for cross-jurisdiction property and financial asset recovery.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1f7e5fb1b_generated_image.png",
    imgAlt: "Alliance Trust Realty institutional real estate and asset recovery — luxury commercial property tower at dusk representing the physical asset management and recovery operations division of GEM Enterprise",
    tags: ["Physical Security", "Cross-Jurisdiction", "Asset Recovery"],
    tier: "Elite",
    color: "amber",
  },
  {
    icon: Globe,
    title: "Federal Compliance & Regulatory",
    slug: "federal-compliance",
    desc: "Specialized regulatory navigation for NIST SP 800-171, CMMC 2.0, SOC 2, ISO 27001, HIPAA, GDPR, and sector-specific mandates. Gap analysis, policy development, and audit readiness.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png",
    imgAlt: "GEM compliance officer at executive desk reviewing multi-screen compliance dashboard showing SOC 2 Type II, ISO 27001, NIST CSF, and HIPAA compliance scorecards with green and amber indicators",
    tags: ["NIST 800-171", "CMMC 2.0", "ISO 27001"],
    tier: "Enterprise",
    color: "blue",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png" alt="GEM Enterprise Security Operations Center running 24/7 global threat monitoring" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-6 max-w-5xl text-center">
          <Badge className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">Our Services</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">Enterprise Service Suite</h1>
          <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Six interconnected disciplines forming a complete institutional security framework — from proactive threat hunting and dark web surveillance to regulatory compliance and physical asset recovery.
          </p>
        </div>
      </section>

      {/* SERVICES GRID — alternating image layout */}
      <section className="container mx-auto px-6 max-w-7xl pb-24">
        <div className="space-y-6">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            const isEven = i % 2 === 0;
            const accentColor = svc.color === "cyan" ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" : svc.color === "red" ? "text-red-400 border-red-500/30 bg-red-500/10" : svc.color === "purple" ? "text-purple-400 border-purple-500/30 bg-purple-500/10" : svc.color === "orange" ? "text-orange-400 border-orange-500/30 bg-orange-500/10" : svc.color === "amber" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" : "text-blue-400 border-blue-500/30 bg-blue-500/10";
            return (
              <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                <div className={`grid lg:grid-cols-2 ${isEven ? "" : "lg:grid-flow-dense"}`}>
                  {/* Image */}
                  <div className={`relative h-72 lg:h-auto ${isEven ? "" : "lg:col-start-2"}`}>
                    <Image src={svc.img} alt={svc.imgAlt} fill className="object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-${isEven ? "r" : "l"} from-transparent to-background/60`} />
                  </div>
                  {/* Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${accentColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={`rounded-full border text-xs ${accentColor}`}>{svc.tier}</Badge>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4">{svc.title}</h2>
                    <p className="text-slate-400 leading-relaxed mb-6">{svc.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {svc.tags.map(t => <span key={t} className={`text-xs border rounded-full px-3 py-1 ${accentColor}`}>{t}</span>)}
                    </div>
                    <Link href={`/services/${svc.slug}`} className={`inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all ${accentColor.split(" ")[0]}`}>
                      Learn More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-black text-white mb-6">Qualified Clients Only</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">All GEM services are delivered under a KYC-gated, compliance-reviewed engagement model. Begin your application to access the full service suite.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-10">
              <Link href="/get-started">Request Access <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
