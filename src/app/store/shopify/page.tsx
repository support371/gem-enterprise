import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCommerceChannel, storeProducts } from "@/lib/storeCatalog";

export const metadata: Metadata = {
  title: "Shopify Store | GEM Enterprise",
  description:
    "Browse GEM Enterprise services available through Shopify checkout and review upcoming Shopify-ready offerings.",
};

const shopifyChannel = getCommerceChannel("shopify-store");
const shopifyProducts = storeProducts.filter((product) =>
  product.channelAvailability.some((item) => item.channelSlug === "shopify-store"),
);

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Official GEM product pages",
    text: "Every Shopify item maps back to an official GEM service page for scope, onboarding, and support.",
  },
  {
    icon: LockKeyhole,
    title: "Secure checkout routing",
    text: "Connected checkout buttons open the approved Shopify destination in a new tab.",
  },
  {
    icon: PackageCheck,
    title: "Structured fulfillment",
    text: "Completed orders continue into GEM intake, service confirmation, and customer onboarding.",
  },
];

export default function ShopifyStorePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10 bg-[#07101c]">
        <div className="container mx-auto max-w-7xl px-6 py-7">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back to GEM Store
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#07101c] py-20 md:py-28">
        <div className="absolute inset-0">
          <Image
            src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/5c6e6baaf_generated_image.png"
            alt="GEM Enterprise Shopify storefront"
            fill
            priority
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07101c] via-[#07101c]/95 to-[#07101c]/75" />
        </div>

        <div className="container relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="mb-5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300">
              <ShoppingBag className="mr-2 h-4 w-4" /> Shopify Store · Connected
            </Badge>
            <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">
              Shopify checkout,
              <span className="block text-cyan-300">backed by GEM onboarding.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Browse services currently mapped to Shopify, open the approved checkout destination, and return to GEM for onboarding, support, and delivery confirmation.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                <Link href="#shopify-products">
                  Browse Shopify Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {shopifyChannel?.canonicalUrl && (
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
                  <a href={shopifyChannel.canonicalUrl} target="_blank" rel="noreferrer">
                    Open Connected Checkout <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-cyan-500/20 bg-white/[0.04] p-7 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Channel status</div>
                <div className="mt-2 text-2xl font-black text-white">Connected</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <BadgeCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-500">Mapped items</div>
                <div className="mt-2 text-3xl font-black text-white">{shopifyProducts.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-500">Live checkout</div>
                <div className="mt-2 text-3xl font-black text-white">
                  {shopifyProducts.filter((product) => Boolean(product.checkoutUrl)).length}
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-slate-400">
              {shopifyChannel?.statusDetails ?? "Shopify checkout is available for selected GEM services."}
            </p>
          </aside>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.02] py-10">
        <div className="container mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-3">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/10 p-5">
              <Icon className="h-5 w-5 text-cyan-300" />
              <h2 className="mt-4 font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="shopify-products" className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-3xl">
          <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            Shopify catalog
          </Badge>
          <h2 className="text-4xl font-black text-white md:text-5xl">Products mapped to Shopify</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            Live items include a direct checkout button. Planned items route to GEM for pricing, qualification, or listing preparation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {shopifyProducts.map((product) => {
            const availability = product.channelAvailability.find(
              (item) => item.channelSlug === "shopify-store",
            );
            const hasCheckout = Boolean(product.checkoutUrl);

            return (
              <article
                key={product.slug}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition-all hover:border-cyan-400/40 hover:bg-white/[0.04]"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={`${product.name} on the GEM Shopify store`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-cyan-500/30 bg-[#07101c]/85 text-cyan-300 backdrop-blur">
                      {availability?.status ?? "Planned"}
                    </Badge>
                    <Badge className="rounded-full border border-white/10 bg-[#07101c]/85 text-slate-300 backdrop-blur">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                  <p className="mt-4 leading-relaxed text-slate-400">{product.shortDescription}</p>

                  <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      <span>{product.delivery}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      <span>{product.onboarding}</span>
                    </div>
                  </div>

                  {availability?.note && (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-slate-300">
                      {availability.note}
                    </div>
                  )}

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                      <Link href={`/store/${product.slug}`}>View Product Details</Link>
                    </Button>
                    {hasCheckout ? (
                      <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <a href={product.checkoutUrl} target="_blank" rel="noreferrer">
                          Buy on Shopify <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Link href={`/contact?service=${encodeURIComponent(product.slug)}&channel=shopify`}>
                          Request Shopify Listing
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#07101c] py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              Purchase flow
            </Badge>
            <h2 className="text-4xl font-black text-white">From Shopify checkout to GEM delivery</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Shopify handles the connected payment destination. GEM remains responsible for confirming scope, onboarding the customer, and delivering the service.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              "Review the official GEM product page",
              "Open the connected Shopify checkout",
              "Complete checkout using the available Shopify payment methods",
              "Receive GEM intake and onboarding instructions",
              "Begin the confirmed service delivery process",
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-xl border border-white/10 bg-background/60 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-sm font-black text-cyan-300">
                  {index + 1}
                </span>
                <span className="font-medium text-white">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-black text-white">Need a different product added to Shopify?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
          Request a listing review so GEM can confirm pricing, scope, fulfillment, checkout language, and onboarding requirements before publishing it.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-full bg-cyan-400 px-9 font-semibold text-black hover:bg-cyan-300">
            <Link href="/contact?channel=shopify">Request Shopify Listing</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-9 text-white hover:bg-white/10">
            <Link href="/store">Browse Full GEM Store</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
