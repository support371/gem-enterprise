import Link from "next/link";
import { ATR_OPERATIONAL_CONFIG } from "@/lib/atrOperationalConfig";

const routes = [
  { href: "/atr", label: "Alliance Trust Realty" },
  { href: "/atr/properties", label: "Properties" },
  { href: "/atr/invest", label: "Investment Platform" },
  { href: "/client-login", label: "GEM Client Login" },
];

export default function ATROperationalStatusPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                GEM Operational Control
              </p>
              <h1 className="mt-3 text-4xl font-bold">Alliance Trust Realty</h1>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              {ATR_OPERATIONAL_CONFIG.operationalStatus}
            </span>
          </div>

          <p className="mt-6 max-w-3xl text-slate-300">
            Alliance Trust Realty is active as the GEM real-estate division through GEM-controlled
            application routes. Its operation does not depend on registrar control of the external
            alliancetrustrealty.com domain.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Active route</h2>
            <p className="mt-2 break-all text-cyan-300">{ATR_OPERATIONAL_CONFIG.publicOrigin}</p>
            <p className="mt-3 text-sm text-slate-400">
              Preferred GEM-managed host: {ATR_OPERATIONAL_CONFIG.managedHost}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6">
            <h2 className="text-lg font-semibold">External domain status</h2>
            <p className="mt-2 text-amber-200">{ATR_OPERATIONAL_CONFIG.domainStatus}</p>
            <p className="mt-3 text-sm text-slate-400">
              {ATR_OPERATIONAL_CONFIG.domainUsePolicy}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Operational routes</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-xl border border-white/10 bg-slate-900/70 px-5 py-4 font-medium transition hover:border-cyan-300/40 hover:bg-cyan-300/5"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
          <p>
            Operational owner: {ATR_OPERATIONAL_CONFIG.operationalOwner}. This status describes GEM
            application control only; it does not assert registrar ownership of the disputed domain.
          </p>
        </section>
      </div>
    </main>
  );
}
