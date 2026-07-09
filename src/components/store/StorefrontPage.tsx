import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorefrontProductGrid } from "@/components/store/StorefrontProductGrid";
import {
  getProductsForStorefront,
  getStorefrontDefinition,
  type StorefrontDefinition,
  type StorefrontSlug,
} from "@/lib/storefrontCatalog";
import { tiktokPlanningCategories, tiktokPlanningProducts } from "@/lib/tiktokPlanningCatalog";
import {
  catalogueRelianceNotice,
  publicStorefrontStatus,
} from "@/lib/storefrontPresentation";

type Props = {
  storefront: StorefrontSlug;
  eyebrow?: string;
  title?: string;
  description?: string;
  status?: StorefrontDefinition["status"];
  externalUrl?: string;
  externalLabel?: string;
};

export function StorefrontPage({
  storefront,
  eyebrow,
  title,
  description,
  externalUrl,
  externalLabel,
}: Props) {
  const definition = getStorefrontDefinition(storefront);
  const products = storefront === "tiktok" ? tiktokPlanningProducts : getProductsForStorefront(storefront);
  const categories = storefront === "tiktok" ? tiktokPlanningCategories : definition?.categories ?? ["All"];
  if (!definition) return null;

  const activeEyebrow = eyebrow ?? definition.eyebrow;
  const activeTitle = title ?? definition.title;
  const activeDescription = description ?? definition.description;
  const activeExternalUrl = externalUrl ?? definition.externalUrl;
  const activeExternalLabel = externalLabel ?? definition.externalLabel;
  const hasExternal = Boolean(activeExternalUrl && activeExternalLabel);

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

      <section className="border-b border-white/10 bg-[#07101c]">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" /> Back to GEM catalogue
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#07101c] py-20">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="container relative z-10 mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="mb-5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-cyan-300">
              <ShoppingBag className="mr-2 h-4 w-4" /> {activeEyebrow}
            </Badge>
            <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">{activeTitle}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              {activeDescription} This page is a catalogue and planning surface, not proof that
              the external channel, checkout, inventory, licensing, or fulfillment is active.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                <Link href="#products">
                  Browse Catalogue <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
                <Link href={`/contact?store=${storefront}&subject=channel-verification`}>
                  Request Channel Verification
                </Link>
              </Button>
            </div>
          </div>

          <aside className="rounded-3xl border border-cyan-500/20 bg-white/[0.035] p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Public status</div>
                <div className="mt-2 text-2xl font-black text-white">
                  {storefront === "tiktok" ? "Planning catalogue — validation pending" : publicStorefrontStatus(definition)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-500">Items shown</div>
                <div className="mt-2 text-3xl font-black text-white">{products.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-widest text-slate-500">Categories</div>
                <div className="mt-2 text-3xl font-black text-white">{Math.max(categories.length - 1, 0)}</div>
              </div>
            </div>
            {hasExternal && (
              <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
                <div className="text-xs uppercase tracking-widest text-amber-200">Unverified external reference</div>
                <div className="mt-2 break-all text-sm font-semibold text-white">{activeExternalUrl}</div>
                <p className="mt-3 text-xs leading-5 text-amber-50/80">
                  Confirm the domain, seller identity, item, amount, refund terms, and
                  fulfillment process before sending payment or personal information.
                </p>
                <a
                  href={activeExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-transparent px-5 py-2 text-sm font-bold text-amber-100 transition-colors hover:bg-amber-100/10"
                >
                  Open reference cautiously <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
            <p className="mt-6 text-sm leading-relaxed text-slate-400">
              GEM remains the enquiry and verification point. No external channel is described
              as approved for payment until its ownership and fulfillment path are tested.
            </p>
          </aside>
        </div>
      </section>

      <section id="products" className="container mx-auto max-w-7xl px-6 py-20">
        <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-300">
          {definition.name}
        </Badge>
        <h2 className="text-4xl font-black text-white">Catalogue items for review</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-400">
          Search and filter proposed items, then submit an enquiry. This page does not create an
          order, charge a payment method, reserve stock, start a subscription, or activate a service.
        </p>
        {storefront === "tiktok" && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-relaxed text-amber-100">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              These planning records remain draft listings until real images, GTIN/UPC or an
              approved exemption, physical inventory where applicable, category eligibility,
              shipping data, seller identity, and TikTok Seller Center approval are confirmed.
            </p>
          </div>
        )}
        <div className="mt-10">
          <StorefrontProductGrid products={products} storefront={storefront} categories={categories} />
        </div>
      </section>
    </main>
  );
}
