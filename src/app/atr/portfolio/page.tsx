import Link from "next/link";
import { Building2, Home, Landmark, MapPin } from "lucide-react";

const portfolio = [
  { icon: Home, title: "Residential", detail: "Single-family and multifamily opportunities", href: "/atr/buy" },
  { icon: Building2, title: "Commercial", detail: "Office, retail, and mixed-use review", href: "/atr/properties" },
  { icon: Landmark, title: "Investment", detail: "Income and portfolio-fit analysis", href: "/atr/invest" },
];

export default function PortfolioPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Portfolio</p>
          <h1 className="text-4xl font-black md:text-6xl">Property and investment opportunities in one controlled view.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Use this portfolio gateway to move between property discovery, investor analysis, and managed review without leaving the Alliance Trust Realty experience.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {portfolio.map(({ icon: Icon, title, detail, href }) => (
          <Link key={title} href={href} className="group rounded-2xl border border-slate-200 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <Icon className="h-8 w-8 text-amber-600" />
            <h2 className="mt-5 text-2xl font-black">{title}</h2>
            <p className="mt-3 text-slate-600">{detail}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-700">Explore <MapPin className="h-4 w-4" /></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
