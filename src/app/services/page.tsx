import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Zap,
  Lock,
  Eye,
  Building2,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Services",
  description:
    "Cybersecurity, compliance, financial-security coordination, and property-risk services, subject to scope, eligibility, provider availability, and signed agreements.",
};

const services = [
  {
    icon: Shield,
    title: "Managed Threat Monitoring",
    slug: "threat-monitoring",
    desc: "Monitoring, triage, and escalation services can be arranged for eligible clients through an approved service scope. Coverage hours, tooling, staffing, response targets, and data sources are defined in the signed agreement.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png",
    imgAlt: "Illustrative managed security monitoring interface",
    tags: ["Monitoring", "Triage", "Escalation"],
    tier: "Contracted service",
    color: "cyan",
  },
  {
    icon: Zap,
    title: "Incident Response Coordination",
    slug: "incident-response",
    desc: "Incident triage, containment planning, evidence-preservation guidance, and recovery coordination are available according to contracted coverage. Activation windows are service-specific and are not guaranteed by this public page.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/c974a8817_generated_image.png",
    imgAlt: "Illustrative incident response coordination room",
    tags: ["Triage", "Evidence", "Recovery"],
    tier: "Scope required",
    color: "red",
  },
  {
    icon: Eye,
    title: "Exposure & Dark-Web Monitoring",
    slug: "dark-web",
    desc: "Authorized exposure monitoring may include approved breach-data, credential, domain, and public-risk sources. Data coverage, provider limitations, alert timing, and escalation routes are defined before activation.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/86e283cd8_generated_image.png",
    imgAlt: "Illustrative exposure-monitoring interface",
    tags: ["Exposure", "Credentials", "Alerts"],
    tier: "Provider dependent",
    color: "purple",
  },
  {
    icon: Lock,
    title: "Security Assessment & Testing",
    slug: "red-team",
    desc: "Authorized security assessments may cover applications, infrastructure, configuration, and selected human-process controls. Testing requires written scope, ownership verification, rules of engagement, and approved timing.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/ca12688fe_generated_image.png",
    imgAlt: "Illustrative authorized security testing workstation",
    tags: ["Assessment", "Validation", "Remediation"],
    tier: "Written authorization",
    color: "orange",
  },
  {
    icon: Building2,
    title: "Asset & Property Risk Coordination",
    slug: "asset-recovery",
    desc: "GEM can coordinate risk review, documentation, specialist referrals, and authorized recovery support where appropriate. Legal authority, ownership, jurisdiction, provider capability, and engagement limits are verified before action.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/1f7e5fb1b7b1794c3dc01661/1f7e5fb1b_generated_image.png",
    imgAlt: "Illustrative property and asset-risk management image",
    tags: ["Risk Review", "Referrals", "Documentation"],
    tier: "Eligibility review",
    color: "amber",
  },
  {
    icon: Globe,
    title: "Compliance Readiness Support",
    slug: "federal-compliance",
    desc: "Readiness support may include gap assessment, control mapping, policy development, evidence planning, and remediation tracking. Framework alignment is not certification and does not replace legal or accredited audit advice.",
    img: "https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png",
    imgAlt: "Illustrative compliance readiness dashboard",
    tags: ["NIST", "SOC 2", "ISO 27001"],
    tier: "Readiness support",
    color: "blue",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden pb-24 pt-32">
        <div className="absolute inset-0">
          <Image
            src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png"
            alt="Illustrative enterprise security operations interface"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        </div>
        <div className="container relative z-10 mx-auto max-w-5xl px-6 text-center">
          <Badge className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-widest text-cyan-400">
            Service capabilities
          </Badge>
          <h1 className="mb-6 text-5xl font-black text-white md:text-7xl">
            Enterprise Service Suite
          </h1>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-400">
            Services are activated only after scope, eligibility, staffing, provider,
            jurisdiction, security, and contractual requirements have been confirmed.
            Public descriptions do not create an SLA or guarantee availability.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 pb-24">
        <div className="space-y-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 0;
            const accentColor =
              service.color === "cyan"
                ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
                : service.color === "red"
                  ? "text-red-400 border-red-500/30 bg-red-500/10"
                  : service.color === "purple"
                    ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                    : service.color === "orange"
                      ? "text-orange-400 border-orange-500/30 bg-orange-500/10"
                      : service.color === "amber"
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        : "text-blue-400 border-blue-500/30 bg-blue-500/10";

            return (
              <article
                key={service.slug}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all hover:border-white/20"
              >
                <div className={`grid lg:grid-cols-2 ${isEven ? "" : "lg:grid-flow-dense"}`}>
                  <div className={`relative h-72 lg:h-auto ${isEven ? "" : "lg:col-start-2"}`}>
                    <Image src={service.img} alt={service.imgAlt} fill className="object-cover" />
                    <div
                      className={`absolute inset-0 ${isEven ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-transparent to-background/60`}
                    />
                    <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
                      Illustrative image
                    </span>
                  </div>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${accentColor}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <Badge className={`rounded-full border text-xs ${accentColor}`}>
                        {service.tier}
                      </Badge>
                    </div>
                    <h2 className="mb-4 text-2xl font-black text-white md:text-3xl">
                      {service.title}
                    </h2>
                    <p className="mb-6 leading-relaxed text-slate-400">{service.desc}</p>
                    <div className="mb-6 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span key={tag} className={`rounded-full border px-3 py-1 text-xs ${accentColor}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/services/${service.slug}`}
                      className={`inline-flex items-center gap-2 font-semibold transition-all hover:gap-3 ${accentColor.split(" ")[0]}`}
                    >
                      Review scope and limitations <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-24 text-center">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="mb-6 text-4xl font-black text-white">Start with a documented scope</h2>
          <p className="mb-10 text-lg leading-relaxed text-slate-400">
            Public information is available broadly. Services involving sensitive data,
            regulated activities, high-value assets, monitoring, or incident response require
            eligibility review and a signed statement of work before activation.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-10 font-semibold text-black hover:bg-cyan-500">
              <Link href="/get-started">
                Request an assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-10 font-semibold text-white hover:bg-white/10">
              <Link href="/contact">Talk to a specialist</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
