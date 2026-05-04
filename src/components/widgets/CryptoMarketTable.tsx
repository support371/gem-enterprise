import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// -- Types ------------------------------------------------------------------

interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  last_updated: string;
}

interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  imageUrl: string;
  lastUpdated: string;
}

// -- Config -----------------------------------------------------------------

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const TRACKED_IDS = "bitcoin,ethereum,solana,ripple,cardano,polkadot,chainlink,avalanche-2";
const POLL_INTERVAL_MS = 60_000; // 60 seconds
const MAX_RETRIES = 3;

// -- Helpers ----------------------------------------------------------------

function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${value.toFixed(value < 1 ? 6 : 2)}`;
}

function mapToAsset(coin: CoinGeckoPrice): MarketAsset {
  return {
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h ?? 0,
    marketCap: coin.market_cap,
    volume24h: coin.total_volume,
    imageUrl: coin.image,
    lastUpdated: coin.last_updated,
  };
}

// -- Hook -------------------------------------------------------------------

function useCryptoMarket() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPrices = useCallback(async () => {
    try {
      const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${TRACKED_IDS}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limited by pricing API. Retrying shortly.");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data: CoinGeckoPrice[] = await response.json();

      // Validate response structure
      if (!Array.isArray(data)) {
        throw new Error("Invalid API response format");
      }

      const mapped = data.map(mapToAsset);
      setAssets(mapped);
      setError(null);
      setRetryCount(0);
      setLastFetch(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch market data";
      setError(message);
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { assets, loading, error, lastFetch, refresh: fetchPrices };
}

// -- Component --------------------------------------------------------------

export function CryptoMarketTable() {
  const { assets, loading, error, lastFetch, refresh } = useCryptoMarket();

  return (
    <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Digital Asset Monitor
        </h2>
        <div className="flex items-center gap-3">
          {lastFetch && (
            <span className="text-xs text-muted-foreground">
              Updated {lastFetch.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 px-5 py-3 bg-destructive/5 border-b border-destructive/20 text-xs text-destructive">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && assets.length === 0 && (
        <div className="divide-y divide-border/40">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
                <div className="h-2 w-16 bg-secondary rounded animate-pulse" />
              </div>
              <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {assets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border/40">
                <th className="text-left px-5 py-3 font-medium">Asset</th>
                <th className="text-right px-3 py-3 font-medium">Price</th>
                <th className="text-right px-3 py-3 font-medium">24h</th>
                <th className="text-right px-3 py-3 font-medium hidden sm:table-cell">Market Cap</th>
                <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Volume (24h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {assets.map((asset) => {
                const isPositive = asset.change24h >= 0;
                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-sidebar-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={asset.imageUrl}
                          alt={asset.name}
                          className="w-7 h-7 rounded-full"
                          loading="lazy"
                        />
                        <div>
                          <span className="font-medium text-foreground">{asset.symbol}</span>
                          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{asset.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-3 py-3.5 font-mono text-foreground">
                      {formatUsd(asset.price)}
                    </td>
                    <td className="text-right px-3 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
                          isPositive
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isPositive ? "+" : ""}
                        {asset.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right px-3 py-3.5 text-muted-foreground hidden sm:table-cell">
                      {formatUsd(asset.marketCap)}
                    </td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      {formatUsd(asset.volume24h)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-border/50 text-xs text-muted-foreground">
        <Shield className="w-3 h-3 text-primary shrink-0" />
        <span>Data sourced from CoinGecko public API. Prices are indicative and not financial advice.</span>
      </div>
    </div>
  );
}
