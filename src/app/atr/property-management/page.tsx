import Link from "next/link";
import { Building2, ClipboardCheck, ShieldCheck, Wrench } from "lucide-react";

const services = [
  { icon: Building2, title: "Portfolio Operations", text: "Structured oversight for residential, multifamily, commercial, and mixed-use assets." },
  { icon: ClipboardCheck, title: "Owner Reporting", text: "Clear operating summaries, property-readiness tracking, and documented next actions." },
  { icon: Wrench, title: "Maintenance Coordination", text: "Issue intake, vendor coordination, and owner-approved maintenance workflows." },
  { icon: ShieldCheck, title: "GEM Governance", text: "Security, compliance, access control, and auditability remain governed by GEM Enterprise." },
];

export default function PropertyManagementPage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Property Management</p>
          <h1 className="max-w-3xl text-4xl font-black md:text-6xl">Operational property care under GEM control.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Alliance Trust Realty coordinates property-management workflows while GEM supplies the operational, security, and audit layer around sensitive actions.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/atr/contact" className="rounded-xl bg-amber-600 px-6 py-3 font-bold text-white hover:bg-amber-500">Request Management Review</Link>
            <Link href="/atr/portfolio" className="rounded-xl border border-white/20 px-6 py-3 font-bold text-white hover:bg-white/10">View Portfolio</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-2">
        {services.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <Icon className="mb-5 h-7 w-7 text-amber-600" />
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
