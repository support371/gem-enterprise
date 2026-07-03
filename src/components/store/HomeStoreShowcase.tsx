import Link from "next/link";
import { ArrowRight, Package, ShieldCheck, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { storefrontDefinitions, storefrontProducts } from "@/lib/storefrontCatalog";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function HomeStoreShowcase() {
  const featuredProducts = storefrontProducts.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-y border-cyan-500/10 bg-[#08111d] py-24">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-widest text-cyan-300">
              <ShoppingBag className="mr-2 h-3.5 w-3.5" /> GEM Enterprise Store
            </Badge>
            <h2 className="text-4xl font-black text-white md:text-5xl">
              All products, organized into dedicated store pages
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Enter the Main Store for the complete catalog, or use Campaign Hub, TikTok Shop, Shopify, Google Merchant, and Wix Store as focused subpages inside the GEM website.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {storefrontDefinitions.map((storefront) => (
                <Link
                  key={storefront.slug}
                  href={`/store/${storefront.slug}`}
                  className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200 transition-colors hover:border-cyan-400/50 hover:text-white"
                >
                  {storefront.shortName}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
              <Link href="/store/main">
                Open Main Store <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
              <Link href="/store">View All Products</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-all hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.045]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  {product.deliveryType === "Digital" ? <ShieldCheck className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                </div>
                <Badge className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  {product.stockLabel}
                </Badge>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{product.name}</h3>
              <p className="mt-3 min-h-20 text-sm leading-relaxed text-slate-400">{product.shortDescription}</p>
              <div className="mt-5 text-2xl font-black text-cyan-300">{formatMoney(product.price)}</div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-xs uppercase tracking-widest text-slate-500">{product.sku}</span>
                <Link href="/store/main" className="inline-flex items-center font-semibold text-cyan-300 hover:text-cyan-200">
                  View product <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
