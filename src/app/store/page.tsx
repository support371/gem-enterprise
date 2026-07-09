import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
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
import { TIKTOK_MAIN_STORE_URL } from "@/lib/storefrontDestinations";
import {
  catalogueRelianceNotice,
  publicStorefrontStatus,
} from "@/lib/storefrontPresentation";

export const metadata: Metadata = {
  title: "GEM Product & Service Catalogue",
  description:
    "Browse proposed GEM Enterprise products and service packages and submit an enquiry for availability, scope, price, licensing, and fulfillment review.",
};

const categories = [
  "All",
  ...Array.from(new Set(storefrontProducts.map((product) => product.category))),
];

const trustItems = [
  {
    icon: Truck,
    title: "Delivery confirmed in writing",
    text: "Physical, digital, and service delivery terms are confirmed before an order or engagement is accepted.",
  },
  {
    icon: ShieldCheck,
    title: "No assumed activation",
    text: "A catalogue entry or external link does not activate monitoring, software, support, or an SLA.",
  },
  {
    icon: RefreshCcw,
    title: "Channels require verification",
    text: "Shopify, TikTok, Google, Wix, Facebook, and campaign destinations are used only after ownership and fulfillment checks.",
  },
  {
    icon: BadgeCheck,
    title: "Scope before payment",
    text: "GEM confirms provider capability, licensing, final price, taxes, refunds, and fulfillment before acceptance.",
  },
];

export default function StorePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-4 text-amber-100">
        <div className="container mx-auto flex max-w-7xl items-start gap-3 px-2 text-sm leading-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            <strong>Request-only catalogue:</strong> {catalogueRelianceNotice}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#07101c] py-20 md:py-28">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6">
          <Badge className="mb-5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300">
            <ShoppingBag className="mr-2 h-4 w-4" /> GEM Catalogue
          </Badge>
          <h1 className="max-w-5xl text-5xl font-black leading-tight text-white md:text-7xl">
            Explore products and services,
            <span className="block text-cyan-300">then request written confirmation.</span>
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-300 md:text-xl">
            Review proposed offerings and channel pages. GEM confirms whether an item is
            operationally available, who provides it, what is included, the final price,
            delivery terms, refund terms, and any eligibility requirements before acceptance.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
              <Link href="#all-products">
                Browse Catalogue <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
              <Link href="/contact?subject=product-enquiry">Submit an Enquiry</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.02] py-8">
        <div className="container mx-auto grid max-w-7xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/10 p-5">
              <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              <h2 className="mt-4 font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10">
          <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <Store className="mr-2 h-4 w-4" /> Catalogue channels
          </Badge>
          <h2 className="text-4xl font-black text-white md:text-5xl">
            Review each channel before leaving GEM
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">
            An external destination is shown only as a channel reference. Confirm the domain,
            seller identity, product terms, payment amount, refund policy, and fulfillment
            process before submitting payment or personal information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {storefrontDefinitions.map((storefront) => {
            const count = storefrontProducts.filter((product) =>
              product.storefronts.includes(storefront.slug),
            ).length;
            const externalUrl =
              storefront.slug === "tiktok" ? TIKTOK_MAIN_STORE_URL : storefront.externalUrl;
            const externalLabel =
              storefront.slug === "tiktok" ? "Open referenced TikTok destination" : storefront.externalLabel;

            return (
              <article
                key={storefront.slug}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition-all hover:border-cyan-400/40 hover:bg-white/[0.045]"
              >
                <Badge className="rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-200">
                  {publicStorefrontStatus(storefront)}
                </Badge>
                <h3 className="mt-5 text-2xl font-bold text-white">{storefront.name}</h3>
                <p className="mt-3 min-h-24 text-sm leading-relaxed text-slate-400">
                  {storefront.description} Availability and transaction readiness require separate verification.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Items shown</div>
                    <div className="mt-2 text-2xl font-black text-white">{count}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Categories</div>
                    <div className="mt-2 text-2xl font-black text-white">
                      {Math.max(storefront.categories.length - 1, 0)}
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                    <Link href={`/store/${storefront.slug}`}>
                      Review {storefront.shortName} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {externalUrl && externalLabel && (
                    <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                        {externalLabel} <ExternalLink className="ml-2 h-4 w-4" />
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
          <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-300">
            Proposed catalogue
          </Badge>
          <h2 className="text-4xl font-black text-white md:text-5xl">Product and service enquiries</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">
            Search by product name, category, description, or SKU. Add items to an enquiry;
            this interface does not create a cart, charge a payment method, reserve inventory,
            start a subscription, or activate a service.
          </p>
          <div className="mt-10">
            <StorefrontProductGrid products={storefrontProducts} storefront="main" categories={categories} />
          </div>
        </div>
      </section>
    </main>
  );
}
