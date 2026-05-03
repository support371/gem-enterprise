import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rate Limits — Gem Enterprise Docs",
  description:
    "Understand Gem Enterprise API rate limit tiers, response headers, 429 handling, and best practices for caching and backoff.",
};

export default function RateLimitsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Rate Limits</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Gem Enterprise enforces per-key rate limits to ensure fair usage and
          platform stability. Limits are applied on a rolling 60-second window
          and are tracked per API key, not per IP address.
        </p>
      </div>

      {/* Tiers */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Rate Limit Tiers
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Plan</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Requests / min</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Burst allowance</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                ["Free", "100", "120", "Development and evaluation use only"],
                ["Pro", "1,000", "1,200", "Suitable for production workloads up to mid-scale"],
                ["Enterprise", "Unlimited", "Unlimited", "Subject to fair-use policy; SLA guaranteed"],
              ].map(([plan, rpm, burst, note]) => (
                <tr key={plan} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 text-white font-medium">{plan}</td>
                  <td className="px-4 py-3 font-mono text-green-300 text-xs">{rpm}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{burst}</td>
                  <td className="px-4 py-3 text-slate-400">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-500 text-xs">
          Burst allowance permits a short spike above the sustained limit. Burst
          tokens replenish over the same 60-second window.
        </p>
      </section>

      {/* Response Headers */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Response Headers
        </h2>
        <p className="text-slate-400 text-sm">
          Every API response includes the following rate-limit headers so you
          can monitor your consumption and back off before hitting the limit:
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Header</th>
                <th className="text-left px-4 py-3 text-slate-300 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                ["X-RateLimit-Limit", "Maximum requests allowed in the current window"],
                ["X-RateLimit-Remaining", "Requests remaining in the current window"],
                ["X-RateLimit-Reset", "Unix timestamp (UTC) when the window resets"],
                ["Retry-After", "Seconds to wait before retrying (only present on 429 responses)"],
              ].map(([header, desc]) => (
                <tr key={header} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-mono text-green-300 text-xs">{header}</td>
                  <td className="px-4 py-3 text-slate-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-400 text-sm">Example response headers:</p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`HTTP/2 200 OK
X-RateLimit-Limit:     1000
X-RateLimit-Remaining: 947
X-RateLimit-Reset:     1746273660`}
        </pre>
      </section>

      {/* 429 Response */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          429 — Too Many Requests
        </h2>
        <p className="text-slate-400 text-sm">
          When the limit is exceeded the API returns{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">HTTP 429</code> with a JSON
          body and a{" "}
          <code className="text-slate-300 bg-slate-800 px-1 rounded">Retry-After</code> header:
        </p>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`HTTP/2 429 Too Many Requests
Retry-After: 14
X-RateLimit-Limit:     1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset:     1746273660

{
  "error":   "Rate limit exceeded",
  "code":    "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit":       1000,
    "window":      "60s",
    "retry_after": 14
  }
}`}
        </pre>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">
          Best Practices
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-200">1. Cache responses</h3>
            <p className="text-slate-400 text-sm">
              Many resources (threat definitions, asset lists) change
              infrequently. Cache them in Redis or an in-memory store and
              revalidate on a schedule rather than fetching on every request.
            </p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`// Node.js example — simple TTL cache
const cache = new Map<string, { data: unknown; expiresAt: number }>();

async function getCachedThreats() {
  const key = "threats:critical";
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const data = await client.threats.list({ severity: ["critical"] });
  cache.set(key, { data, expiresAt: Date.now() + 60_000 }); // 60 s TTL
  return data;
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-200">2. Exponential backoff with jitter</h3>
            <p className="text-slate-400 text-sm">
              When you receive a 429, wait at least{" "}
              <code className="text-slate-300 bg-slate-800 px-1 rounded">Retry-After</code> seconds
              before retrying. Add random jitter to prevent thundering-herd
              behaviour when multiple instances back off simultaneously.
            </p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`async function withBackoff<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (attempt === maxAttempts - 1) throw err;
      const isRateLimit =
        err instanceof GemApiError && err.statusCode === 429;
      if (!isRateLimit) throw err;

      const base   = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s …
      const jitter = Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, base + jitter));
    }
  }
  throw new Error("unreachable");
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-200">3. Monitor remaining quota</h3>
            <p className="text-slate-400 text-sm">
              Inspect{" "}
              <code className="text-slate-300 bg-slate-800 px-1 rounded">X-RateLimit-Remaining</code>{" "}
              on every response and pause proactively when it approaches zero,
              rather than waiting for a 429 to occur.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
