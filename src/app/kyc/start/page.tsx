import Link from "next/link";
import Image from "next/image";
import { Shield, CheckCircle, Clock, FileText, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "KYC Verification | GEM Enterprise",
  description: "Complete your identity verification to unlock full access to the GEM Enterprise platform.",
};

const steps = [
  { icon: User, title: "Identity Verification", desc: "Upload a government-issued photo ID and complete a live selfie capture. Processed securely by our compliance team.", time: "~3 minutes" },
  { icon: FileText, title: "Entity Documentation", desc: "For business, trust, or family office applicants. Provide supporting entity documents. Personal applicants skip this step.", time: "~5 minutes" },
  { icon: Shield, title: "Compliance Review", desc: "Our compliance team reviews your submission within 24–48 business hours. You will receive an email notification on your status.", time: "24–48 hrs" },
  { icon: CheckCircle, title: "Access Granted", desc: "Upon approval, your entitled service tier is unlocked in your secure portal. Full platform access is immediate.", time: "Instant" },
];

export default function KYCStartPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        <div className="relative h-[480px]">
          <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/f42ed0ce5_generated_image.png" alt="GEM Enterprise KYC verification — a professional woman confidently holding her government-issued photo ID toward a verification camera in a softly lit modern office. The interface behind her shows a document upload zone, live selfie capture circle, and a green verified checkmark — representing GEM's secure, fast identity verification process for institutional onboarding." fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 flex items-end pb-16">
            <div className="container mx-auto px-6 max-w-7xl">
              <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs tracking-widest uppercase px-4 py-1.5">Identity Verification</Badge>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4">Complete Your KYC</h1>
              <p className="text-slate-300 text-xl max-w-2xl">Secure identity verification is required to access GEM Enterprise. Under 10 minutes. Reviewed within 48 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-24 container mx-auto px-6 max-w-4xl">
        <h2 className="text-4xl font-black text-white text-center mb-16">The Verification Process</h2>
        <div className="space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex items-start gap-6 hover:border-cyan-500/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">Step {i + 1}: {step.title}</h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {step.time}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500 font-semibold rounded-full px-10">
            <Link href="/kyc/individual">Begin Verification <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
          <p className="text-slate-500 text-xs mt-4">All data is encrypted in transit and at rest. GEM does not sell or share your personal information.</p>
        </div>
      </section>

      {/* WHY KYC */}
      <section className="py-24 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative rounded-2xl overflow-hidden h-[380px]">
              <Image src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/2e5c40e81_generated_image.png" alt="GEM Enterprise KYC compliance team — professional compliance officer reviewing identity verification submissions on a multi-screen compliance dashboard showing AML regulatory indicators and client verification status" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white mb-6">Why Verification Is Required</h2>
              <p className="text-slate-400 leading-relaxed mb-5">GEM Enterprise serves qualified clients with access to sensitive threat intelligence, financial asset protection workflows, and institutional-grade security services. KYC verification ensures the integrity of our client network and protects every member.</p>
              <p className="text-slate-400 leading-relaxed mb-6">Our verification process is compliant with AML and KYC regulatory requirements in the United States (EIN 39-3307036) and the United Kingdom (Companies House SC001731).</p>
              <div className="flex flex-col gap-3">
                {["AML/KYC compliant — US &amp; UK", "SOC 2 Type II data handling standards", "Your data is never sold or shared", "AES-256 encryption in transit &amp; at rest"].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
