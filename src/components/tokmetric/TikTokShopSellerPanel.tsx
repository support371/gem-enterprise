"use client";

import { useState } from "react";

const REVIEW_WORKSPACE_ID = "ws_60488340ded94dcfab3b875ef9ae591c";

type ShopProduct = {
  id?: string;
  title?: string;
  status?: string;
};

export function TikTokShopSellerPanel() {
  const [workspaceId, setWorkspaceId] = useState(REVIEW_WORKSPACE_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const connectHref = `/api/tokmetric/shop/oauth/start?workspaceId=${encodeURIComponent(workspaceId.trim())}`;

  async function syncCatalog() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/tokmetric/shop/catalog?workspaceId=${encodeURIComponent(workspaceId.trim())}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Unable to read the TikTok Shop catalog.");
      setProducts(payload.products || []);
    } catch (reason) {
      setProducts([]);
      setError(reason instanceof Error ? reason.message : "Unable to read the TikTok Shop catalog.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.04] p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">TikTok Shop Seller Center</p>
          <h2 className="mt-2 text-xl font-bold">Authorize the shop and sync approved products</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            This connection is separate from TikTok Login Kit. It reads the authorized seller, shops, and approved product catalog. Product, inventory, price, order, and fulfillment writes remain locked.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(240px,1fr)_auto_auto]">
          <input aria-label="TikTok Shop workspace ID" value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none" />
          <a href={connectHref} className="rounded-xl bg-fuchsia-300 px-4 py-2 text-center text-sm font-bold text-[#160816] hover:bg-fuchsia-200">Connect Shop</a>
          <button type="button" onClick={syncCatalog} disabled={loading || !workspaceId.trim()} className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 disabled:opacity-50">
            {loading ? "Syncing…" : "Sync products"}
          </button>
        </div>
      </div>
      {error && <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100">{error}</p>}
      {products.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {products.map((product, index) => (
            <article key={product.id || `${product.title}-${index}`} className="rounded-xl border border-white/10 bg-black/15 p-4">
              <p className="font-semibold text-white/85">{product.title || "TikTok Shop product"}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">{product.status || "Status not returned"}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
