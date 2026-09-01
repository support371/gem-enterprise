"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export function ProposalCheckoutButton({ token, disabled = false }: { token: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function beginCheckout() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/market/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Secure checkout is not available yet.");
      }
      window.location.assign(result.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Secure checkout is not available yet.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void beginCheckout()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        {loading ? "Opening secure checkout…" : "Accept and continue to payment"}
      </button>
      {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
    </div>
  );
}
