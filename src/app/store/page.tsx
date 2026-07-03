import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorefrontProductGrid } from "@/components/store/StorefrontProductGrid";
import { storefrontDefinitions, storefrontProducts } from "@/lib/storefrontCatalog";

export const metadata: Metadata = {
  title: "GEM Store | All Products and Store Channels",
  description:
    "Browse all GEM Enterprise products and navigate the Main Store, Campaign Hub, TikTok Shop, Shopify, Google Merchant, and Wix Store subpages.",
};

const categories = [
  "All",
  ...Array.from(new Set(storefrontProducts.map((product) => product.category))),
];

const trustItems = [
  { icon: Truck, title: "Flexible delivery", text: "Physical, digital, and service products are clearly identified." },
  { icon: ShieldCheck, title: "Secure routing", text: "External checkout appears only for approved connected destinations." },
  { icon: RefreshCcw, title: "Channel-ready", text: "Products can be organized across Shopify, TikTok, Google, Wix, and Campaign Hub." },
  { icon: BadgeCheck, title: "GEM supported", text: "Customer requests continue into GEM onboarding and support." },
];

export default function StorePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#07101c] py-20 md:py-28">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6">
          <Badge className="mb-5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300">
            <ShoppingBag className="mr-2 h-4 w-4" /> GEM Enterprise Store
          </Badge>
          <h1 className="max-w-5xl text-5xl font-black leading-tight text-white md:text-7xl">
            All products in one store,
            <span className="block text-cyan-300">organized into clear subpages.</span>
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-300 md:text-xl">
            Browse the combined GEM catalog here, then open the Main Store, Campaign Hub, TikTok Shop, Shopify, Google Merchant, or Wix Store page for channel-specific products and actions.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
              <Link href="#all-products">Browse All Products <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
              <Link href="/store/main">Open Main Store</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.02] py-8">
        <div className="container mx-auto grid max-w-7xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/10 p-5">
              <Icon className="h-5 w-5 text-cyan-300" />
              <h2 className="mt-4 font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10">
          <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <Store className="mr-2 h-4 w-4" /> Store pages
          </Badge>
          <h2 className="text-4xl font-black text-white md:text-5xl">Choose the correct store subpage</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">
            Every store now has its own page, product selection, status, and external destination where one is approved.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {storefrontDefinitions.map((storefront) => {
            const count = storefrontProducts.filter((product) =>
              product.storefronts.includes(storefront.slug),
            ).length;

            return (
              <article key={storefront.slug} className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition-all hover:border-cyan-400/40 hover:bg-white/[0.045]">
                <Badge className="rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">{storefront.status}</Badge>
                <h3 className="mt-5 text-2xl font-bold text-white">{storefront.name}</h3>
                <p className="mt-3 min-h-20 text-sm leading-relaxed text-slate-400">{storefront.description}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Products</div>
                    <div className="mt-2 text-2xl font-black text-white">{count}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Categories</div>
                    <div className="mt-2 text-2xl font-black text-white">{Math.max(storefront.categories.length - 1, 0)}</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                    <Link href={`/store/${storefront.slug}`}>Open {storefront.shortName} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  {storefront.externalUrl && storefront.externalLabel && (
                    <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <a href={storefront.externalUrl} target="_blank" rel="noreferrer">
                        {storefront.externalLabel} <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="all-products" className="border-y border-white/10 bg-white/[0.02] py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-300">All Products</Badge>
          <h2 className="text-4xl font-black text-white md:text-5xl">Complete GEM product catalog</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">
            Search the combined catalog by product name, category, description, or SKU. Add unconnected products to a GEM order request or open an approved checkout where available.
          </p>
          <div className="mt-10">
            <StorefrontProductGrid products={storefrontProducts} storefront="main" categories={categories} />
          </div>
        </div>
      </section>
    </main>
  );
}
