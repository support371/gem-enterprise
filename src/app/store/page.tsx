import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Headphones,
  Megaphone,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { commerceChannels, storeCategories, storeProducts } from "@/lib/storeCatalog";

export const metadata: Metadata = {
  title: "GEM Unified Commerce Store | Shopify, TikTok, Google & Wix",
  description:
    "Shop GEM Enterprise services and navigate connected Shopify, TikTok Shop, Google Merchant, TikTok Campaign Hub, Wix Store Sync, and order channels.",
};

const trustSignals = [
  { icon: ShieldCheck, title: "Public storefront", text: "Visitors can browse products, open product pages, and continue through the available channel." },
  { icon: RefreshCcw, title: "Connected routing", text: "Each product shows Shopify, TikTok, Google, Wix, and campaign availability where applicable." },
  { icon: Headphones, title: "Service handoff", text: "Custom services route into GEM contact and onboarding instead of leaving visitors stranded." },
];

const storeFlow = [
  "Browse official GEM product pages",
  "Choose checkout, quote, booking, or channel status",
  "Use Shopify where payment checkout is connected",
  "Map TikTok, Google, Wix, and campaign flows back to canonical pages",
  "Complete GEM onboarding after purchase or request",
];

function resolveActionUrl(url: string) {
  return url.startsWith("http") ? url : url;
}

export default function StorePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#07101c] py-24 md:py-32">
        <div className="absolute inset-0">
          <Image
            src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/b42c69a20_generated_image.png"
            alt="GEM Enterprise unified commerce network"
            fill
            priority
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07101c]/50 via-[#07101c]/80 to-[#07101c]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-5xl">
            <Badge className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-300">
              <ShoppingBag className="mr-2 h-3.5 w-3.5" />
              GEM Public Store
            </Badge>
            <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">
              Buy, request, or route
              <span className="block text-cyan-300">from one complete store.</span>
            </h1>
            <p className="mt-7 max-w-4xl text-lg leading-relaxed text-slate-300 md:text-xl">
              GEM Cybersecurity Assist now presents a public storefront with direct product actions, channel status, Shopify checkout routing, TikTok campaign routing, Google Merchant preparation, Wix synchronization mapping, and unified order planning.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                <Link href="#solutions">
                  Shop Solutions <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
                <Link href="#commerce-channels">View Store Channels</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.02] py-10">
        <div className="container mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3">
          {trustSignals.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="commerce-channels" className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Store className="mr-2 h-4 w-4" />
              Active store channels
            </Badge>
            <h2 className="text-4xl font-black text-white md:text-5xl">Every store route has a direct action</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">
              Use this section to access the current store channel, checkout route, campaign route, or integration preparation area without guessing where each commerce flow belongs.
            </p>
          </div>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/api/store/catalog" target="_blank">
              Open Catalog API <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {commerceChannels.map((channel) => {
            const mappedCount = storeProducts.filter((product) =>
              product.channelAvailability.some((item) => item.channelSlug === channel.slug),
            ).length;
            return (
              <article
                key={channel.slug}
                id={channel.slug}
                className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition-all hover:border-cyan-400/40 hover:bg-white/[0.045]"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Badge className="mb-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                      {channel.status}
                    </Badge>
                    <h3 className="text-2xl font-bold text-white">{channel.name}</h3>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                    {channel.slug === "tiktok-campaign-hub" ? <Megaphone className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-400">{channel.summary}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{channel.statusDetails}</p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Products</div>
                    <div className="mt-2 text-2xl font-black text-white">{mappedCount}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500">Status</div>
                    <div className="mt-2 font-bold text-cyan-300">{channel.status}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {channel.canonicalUrl ? (
                    <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                      <a href={channel.canonicalUrl} target="_blank" rel="noreferrer">
                        {channel.publicCtaLabel} <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                      <Link href="#solutions">{channel.publicCtaLabel}</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link href={`#${channel.slug}`}>View this section</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="solutions" className="border-y border-white/10 bg-white/[0.02] py-24">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge id="gem-security-services" className="mb-4 scroll-mt-28 rounded-full border border-white/10 bg-white/5 text-slate-300">
                GEM Security Services
              </Badge>
              <h2 className="text-4xl font-black text-white md:text-5xl">Shop the official GEM catalog</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
                Each product now includes details, direct customer action, channel status, and the safest path into checkout or GEM onboarding.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {storeCategories.map((category) => (
                <span key={category} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {storeProducts.map((product) => (
              <article key={product.slug} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition-all hover:border-cyan-400/40 hover:bg-white/[0.04]">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={`${product.name} by GEM Enterprise`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-cyan-500/30 bg-[#07101c]/80 text-cyan-300 backdrop-blur">
                      {product.category}
                    </Badge>
                    <Badge className="rounded-full border border-white/10 bg-[#07101c]/80 text-slate-300 backdrop-blur">
                      {product.purchaseMode}
                    </Badge>
                    {product.featured && <Badge className="rounded-full border-0 bg-cyan-400 text-black">Featured</Badge>}
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                  <p className="mt-4 min-h-16 leading-relaxed text-slate-400">{product.shortDescription}</p>

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

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {product.outcomes.slice(0, 2).map((outcome) => (
                      <div key={outcome} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                        {outcome}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.channelAvailability.map((channel) => (
                      <Link
                        key={channel.channelSlug}
                        href={resolveActionUrl(channel.actionUrl)}
                        className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
                      >
                        {channel.channelSlug.replaceAll("-", " ")}: {channel.status}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-6">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-500">Access</div>
                      <div className="mt-1 font-semibold text-white">{product.priceLabel}</div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                        <Link href={`/store/${product.slug}`}>View Details</Link>
                      </Button>
                      {product.checkoutUrl ? (
                        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <a href={product.checkoutUrl} target="_blank" rel="noreferrer">
                            Buy / Checkout <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Link href={`/contact?service=${encodeURIComponent(product.slug)}`}>{product.primaryCtaLabel}</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#07101c] py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <BadgeCheck className="mr-2 h-4 w-4" />
              Unified commerce routing
            </Badge>
            <h2 className="text-4xl font-black text-white">A clear path from product source to customer action</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Shopify, TikTok Shop, Google Merchant, Wix Store Sync, and TikTok Campaign Hub can exist together under the GEM Enterprise website. Each public button now routes visitors toward the correct action or preparation path.
            </p>
          </div>
          <div className="grid gap-4">
            {storeFlow.map((step, index) => (
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
        <h2 className="text-4xl font-black text-white">Need help choosing the right channel?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
          Use the product details for public purchasing, or contact GEM when a service requires qualification, scoping, or compliance review.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-full bg-cyan-400 px-9 font-semibold text-black hover:bg-cyan-300">
            <Link href="/contact">Contact GEM Support</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-9 text-white hover:bg-white/10">
            <Link href="/api/store/catalog" target="_blank">Open Store Catalog API</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
