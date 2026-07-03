"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StorefrontProduct, StorefrontSlug } from "@/lib/storefrontCatalog";

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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function StorefrontProductGrid({ products, storefront, categories }: StorefrontProductGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatches =
        category === "All" ||
        product.category === category ||
        (category === "Physical Products" && product.deliveryType === "Physical") ||
        (category === "Imported Products" && product.storefronts.includes("wix")) ||
        (category === "Lifestyle" && ["Client Gifts", "Home Safety", "Office Essentials"].includes(product.category)) ||
        (category === "Campaign Services" && product.deliveryType === "Service") ||
        (category === "Lead Generation" && ["Security Awareness", "Cybersecurity"].includes(product.category)) ||
        (category === "Security Services" && ["Cybersecurity", "Security Awareness"].includes(product.category));

      const queryMatches =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.shortDescription.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery);

      return categoryMatches && queryMatches;
    });
  }, [category, products, query]);

  const toggleCart = (productId: string) => {
    setCart((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const cartNames = products
    .filter((product) => cart.includes(product.id))
    .map((product) => product.name)
    .join(", ");

  return (
    <div>
      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, SKU, category..."
            className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
          />
        </label>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
            {filteredProducts.length} products
          </div>
          {cart.length > 0 && (
            <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
              <Link href={`/contact?store=${storefront}&products=${encodeURIComponent(cartNames)}`}>
                Request {cart.length} item{cart.length === 1 ? "" : "s"}
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
                <div className={`relative h-48 border-b bg-gradient-to-br ${accent}`}>
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                      {product.stockLabel}
                    </Badge>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Badge className="rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                        Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>
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
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold tracking-widest text-slate-300">
                    {product.sku}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border border-white/10 bg-white/5 text-slate-300">
                      {product.category}
                    </Badge>
                    <span className="text-xs text-slate-500">{product.deliveryType}</span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">{product.name}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-relaxed text-slate-400">
                    {product.shortDescription}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-2xl font-black text-cyan-300">{formatMoney(product.price)}</div>
                      {product.originalPrice && (
                        <div className="text-sm text-slate-600 line-through">{formatMoney(product.originalPrice)}</div>
                      )}
                    </div>
                    <div className="text-right text-xs uppercase tracking-widest text-slate-600">{product.stockLabel}</div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {product.checkoutUrl ? (
                      <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                        <a href={product.checkoutUrl} target="_blank" rel="noreferrer">
                          Buy now <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => toggleCart(product.id)}
                        className={
                          selected
                            ? "bg-emerald-400 font-semibold text-black hover:bg-emerald-300"
                            : "bg-cyan-400 font-semibold text-black hover:bg-cyan-300"
                        }
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {selected ? "Added" : "Add to request"}
                      </Button>
                    )}
                    <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Link href={`/contact?product=${encodeURIComponent(product.name)}&store=${storefront}`}>
                        Product details
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
          <h3 className="text-2xl font-bold text-white">No matching products</h3>
          <p className="mt-3 text-slate-400">Try another search term or select a different category.</p>
        </div>
      )}
    </div>
  );
}
