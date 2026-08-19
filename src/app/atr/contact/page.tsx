import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Contact</p>
          <h1 className="text-4xl font-black md:text-6xl">Reach Alliance Trust Realty through GEM-controlled channels.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Property, investment, onboarding, and account requests are routed through the same controlled operating environment used by GEM Enterprise.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-16 md:grid-cols-3">
        <a href="mailto:invest@alliancetrustrealty.com" className="rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-lg">
          <Mail className="h-7 w-7 text-amber-600" />
          <h2 className="mt-5 font-black">Investment Desk</h2>
          <p className="mt-2 text-sm text-slate-600">invest@alliancetrustrealty.com</p>
        </a>
        <a href="tel:+14017022460" className="rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-lg">
          <Phone className="h-7 w-7 text-amber-600" />
          <h2 className="mt-5 font-black">Phone</h2>
          <p className="mt-2 text-sm text-slate-600">+1 (401) 702-2460</p>
        </a>
        <Link href="/contact" className="rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-lg">
          <ShieldCheck className="h-7 w-7 text-amber-600" />
          <h2 className="mt-5 font-black">GEM Contact Center</h2>
          <p className="mt-2 text-sm text-slate-600">Use the GEM-wide contact and controlled intake workflow.</p>
        </Link>
      </section>
    </main>
  );
}
