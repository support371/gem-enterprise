import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Boxes, ExternalLink, LockKeyhole, Network, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/api/auth-helpers";
import { enterpriseControlDomains, enterpriseProducts } from "@/lib/enterpriseProductRegistry";

export const metadata: Metadata = {
  title: "Enterprise Products | GEM Workspace OS",
  description: "Governed product boundaries and launch points for GEM Enterprise.",
};

function readinessClass(readiness: string) {
  if (readiness === "LIVE") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  if (readiness === "CONTROLLED") return "border-cyan-500/25 bg-cyan-500/10 text-cyan-300";
  return "border-amber-500/25 bg-amber-500/10 text-amber-300";
}

export default async function PlatformProductsPage() {
  const session = await getSession();
  if (!session) redirect("/admin-login");
  if (!isAdminRole(session.role)) redirect("/app/dashboard");

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.09] via-card/80 to-violet-500/[0.06] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <Badge className="border-cyan-500/25 bg-cyan-500/10 text-cyan-300"><Boxes className="mr-1 h-3.5 w-3.5" />Enterprise product directory</Badge>
            <h1 className="mt-4 text-3xl font-bold text-white">One control plane. Separate products.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              GEM Workspace OS governs the company and its product portfolio. Each customer SaaS keeps its own repository, identity, database, secrets, roles, and deployment. Launching a product never grants access to it.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 text-sm text-emerald-100/90">
            <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-300" />Boundary enforcement</p>
            <p className="mt-2 max-w-sm leading-6 text-emerald-100/70">No shared database tables, service keys, browser sessions, or automatic tenant access.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="product-directory-title">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Product portfolio</p>
        <h2 id="product-directory-title" className="mt-1 text-xl font-bold text-white">Governed launch points</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {enterpriseProducts.map((product) => {
            const external = product.launchHref?.startsWith("https://") ?? false;
            return (
              <article key={product.id} className="rounded-2xl border border-white/10 bg-card/75 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge className={readinessClass(product.readiness)}>{product.readiness}</Badge>
                    <h3 className="mt-3 text-lg font-bold text-white">{product.name}</h3>
                  </div>
                  <Badge className="border-white/10 bg-white/[0.04] text-slate-300">{product.boundary === "gem_internal" ? "GEM internal" : "Independent SaaS"}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{product.summary}</p>
                <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
                  <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><dt className="font-semibold text-slate-500">Authentication</dt><dd className="mt-1 leading-5 text-slate-300">{product.authentication}</dd></div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><dt className="font-semibold text-slate-500">Data authority</dt><dd className="mt-1 leading-5 text-slate-300">{product.dataAuthority}</dd></div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><dt className="font-semibold text-slate-500">Repository</dt><dd className="mt-1 break-all leading-5 text-slate-300">{product.repository}</dd></div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><dt className="font-semibold text-slate-500">Operating owner</dt><dd className="mt-1 leading-5 text-slate-300">{product.owner}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">{product.capabilities.map((capability) => <span key={capability} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">{capability}</span>)}</div>
                <div className="mt-5">
                  {product.launchHref ? (
                    <Button asChild className="bg-cyan-500 text-black hover:bg-cyan-400">
                      <Link href={product.launchHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
                        Open product {external ? <ExternalLink className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                      </Link>
                    </Button>
                  ) : <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300"><LockKeyhole className="h-4 w-4" />No launch is exposed until the separate product boundary exists.</p>}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="control-domains-title" className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-start gap-3"><Network className="mt-0.5 h-5 w-5 text-cyan-300" /><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Workspace OS</p><h2 id="control-domains-title" className="mt-1 text-xl font-bold text-white">Where company work lives</h2></div></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {enterpriseControlDomains.map((domain) => (
            <Link key={domain.id} href={domain.href} className="group rounded-xl border border-white/10 bg-card/70 p-4 transition hover:border-cyan-500/30 hover:bg-white/[0.05]">
              <h3 className="font-semibold text-white">{domain.label}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{domain.purpose}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">Open workspace <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
