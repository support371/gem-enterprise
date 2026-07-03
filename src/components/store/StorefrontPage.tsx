import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, ExternalLink, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorefrontProductGrid } from "@/components/store/StorefrontProductGrid";
import { getProductsForStorefront, getStorefrontDefinition, type StorefrontSlug } from "@/lib/storefrontCatalog";

type Props = { storefront: StorefrontSlug };

export function StorefrontPage({ storefront }: Props) {
  const definition = getStorefrontDefinition(storefront);
  const products = getProductsForStorefront(storefront);
  if (!definition) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10 bg-[#07101c]">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" /> Back to GEM Store
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#07101c] py-20">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="container relative z-10 mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="mb-5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300">
              <ShoppingBag className="mr-2 h-4 w-4" /> {definition.eyebrow}
            </Badge>
            <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">{definition.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">{definition.description}</p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                <Link href="#products">Browse Products <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              {definition.externalUrl && definition.externalLabel && (
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
                  <a href={definition.externalUrl} target="_blank" rel="noreferrer">{definition.externalLabel} <ExternalLink className="ml-2 h-5 w-5" /></a>
                </Button>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-cyan-500/20 bg-white/[0.035] p-7">
            <div className="flex items-start justify-between gap-4">
              <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Store status</div><div className="mt-2 text-2xl font-black text-white">{definition.status}</div></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300"><BadgeCheck className="h-6 w-6" /></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-xs uppercase tracking-widest text-slate-500">Products</div><div className="mt-2 text-3xl font-black text-white">{products.length}</div></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-xs uppercase tracking-widest text-slate-500">Categories</div><div className="mt-2 text-3xl font-black text-white">{Math.max(definition.categories.length - 1, 0)}</div></div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-slate-400">The GEM website remains the canonical product and support destination. External checkout appears only when an approved destination exists.</p>
          </aside>
        </div>
      </section>

      <section id="products" className="container mx-auto max-w-7xl px-6 py-20">
        <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-300">{definition.name}</Badge>
        <h2 className="text-4xl font-black text-white">Products for this store</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">Search, filter, review pricing, open an approved checkout, or add products to a GEM order request.</p>
        <div className="mt-10"><StorefrontProductGrid products={products} storefront={storefront} categories={definition.categories} /></div>
      </section>
    </main>
  );
}
