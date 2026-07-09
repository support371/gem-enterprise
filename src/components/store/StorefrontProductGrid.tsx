"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StorefrontProduct, StorefrontSlug } from "@/lib/storefrontCatalog";
import {
  catalogueRelianceNotice,
  formatCataloguePrice,
  publicAvailabilityLabel,
  publicProductDescription,
} from "@/lib/storefrontPresentation";

type StorefrontProductGridProps = {
  products: StorefrontProduct[];
  storefront: StorefrontSlug;
  categories: string[];
};

const accentClasses: Record<StorefrontProduct["accent"], string> = {
  cyan: "from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-300 border-cyan-500/20",
  green: "from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-300 border-emerald-500/20",
  purple: "from-violet-500/20 via-violet-500/5 to-transparent text-violet-300 border-violet-500/20",
  orange: "from-orange-500/20 via-orange-500/5 to-transparent text-orange-300 border-orange-500/20",
  pink: "from-pink-500/20 via-pink-500/5 to-transparent text-pink-300 border-pink-500/20",
};

export function StorefrontProductGrid({ products, storefront, categories }: StorefrontProductGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatches = category === "All" || product.category === category;
      const queryMatches =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.shortDescription.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery);

      return categoryMatches && queryMatches;
    });
  }, [category, products, query]);

  const toggleRequest = (productId: string) => {
    setCart((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const requestNames = products
    .filter((product) => cart.includes(product.id))
    .map((product) => product.name)
    .join(", ");

  return (
    <div>
      <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5 text-sm leading-6 text-amber-50/90">
        {catalogueRelianceNotice}
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search proposed products, SKU, category..."
            className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
          />
        </label>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
            {filteredProducts.length} catalogue items
          </div>
          {cart.length > 0 && (
            <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
              <Link href={`/contact?store=${storefront}&products=${encodeURIComponent(requestNames)}`}>
                Request review for {cart.length}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`min-w-max rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-cyan-400 bg-cyan-400 text-black"
                  : "border-white/10 bg-white/[0.025] text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const selected = cart.includes(product.id);
            const accent = accentClasses[product.accent];

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition-all hover:-translate-y-1 hover:border-cyan-400/35 hover:bg-white/[0.045]"
              >
                <div className={`relative h-52 border-b bg-gradient-to-br ${accent}`}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={`Illustrative catalogue image for ${product.name}`}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-amber-400/30 bg-black/60 text-amber-200 backdrop-blur-sm">
                      {publicAvailabilityLabel(product)}
                    </Badge>
                    <Badge className="rounded-full border border-white/15 bg-black/60 text-white/70 backdrop-blur-sm">
                      Illustrative
                    </Badge>
                  </div>
                  {!product.image && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-current bg-black/20">
                        {product.deliveryType === "Digital" ? (
                          <ShieldCheck className="h-10 w-10" />
                        ) : product.deliveryType === "Service" ? (
                          <CheckCircle2 className="h-10 w-10" />
                        ) : (
                          <Package className="h-10 w-10" />
                        )}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold tracking-widest text-slate-300 backdrop-blur-sm">
                    {product.sku}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border border-white/10 bg-white/5 text-slate-300">
                      {product.category}
                    </Badge>
                    <span className="text-xs text-slate-500">Proposed {product.deliveryType.toLowerCase()}</span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">{product.name}</h3>
                  <p className="mt-3 min-h-32 text-sm leading-relaxed text-slate-400">
                    {publicProductDescription(product)}
                  </p>

                  <div className="mt-5">
                    <div className="text-xs uppercase tracking-widest text-slate-500">
                      Indicative catalogue price
                    </div>
                    <div className="mt-1 text-2xl font-black text-cyan-300">
                      {formatCataloguePrice(product.price)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Final price and terms require written confirmation.</p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={() => toggleRequest(product.id)}
                      className={
                        selected
                          ? "bg-emerald-400 font-semibold text-black hover:bg-emerald-300"
                          : "bg-cyan-400 font-semibold text-black hover:bg-cyan-300"
                      }
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {selected ? "Added to enquiry" : "Add to enquiry"}
                    </Button>
                    <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Link href={`/contact?product=${encodeURIComponent(product.name)}&store=${storefront}`}>
                        Request details
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <h3 className="text-2xl font-bold text-white">No matching catalogue items</h3>
          <p className="mt-3 text-slate-400">Try another search term or select a different category.</p>
        </div>
      )}
    </div>
  );
}
