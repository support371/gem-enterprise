import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Gem Enterprise Docs",
  description:
    "Version history for the Gem Enterprise platform — features, fixes, and improvements across all releases.",
};

export default function ChangelogPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Changelog</h1>
        <p className="text-slate-400 text-base leading-relaxed">
          All notable changes to the Gem Enterprise platform are recorded here.
          Dates reflect the UTC release date. Breaking changes are clearly
          marked.
        </p>
      </div>

      {/* v1.0.0 — Latest */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">v1.0.0</h2>
          <span className="text-xs font-mono bg-emerald-900/50 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded">
            Latest
          </span>
          <span className="text-sm text-slate-500">2026-01-15</span>
        </div>
        <p className="text-slate-400 text-sm">
          General Availability — the Gem Enterprise platform exits its beta
          programme and is now production-ready with full SLA coverage on Pro
          and Enterprise plans.
        </p>
        <ul className="space-y-2 text-sm text-slate-400 list-none pl-0">
          {[
            "API key management — create, rotate, and revoke keys from the dashboard or API",
            "KYC (Know Your Customer) verification flow with document + selfie support",
            "Threat intelligence engine — rule-based alerting with custom severity thresholds",
            "Webhook delivery infrastructure with HMAC-SHA256 signature verification",
            "Role-based access control (RBAC) — Admin, Analyst, and Read-only roles",
            "Audit log API — immutable record of all user and system actions",
            "Multi-organisation support with isolated data namespaces",
            "Production-grade SDKs for Node.js, Python, Go, Ruby, Java, and .NET",
            "Webhooks v2 planned for Q2 2026 — adds portfolio.updated and document.available events",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`# Upgrade from v0.9.0
# No breaking changes — drop-in upgrade

npm install @gem-enterprise/sdk@1.0.0
pip install "gem-enterprise==1.0.0"`}
        </pre>
      </section>

      <hr className="border-slate-800" />

      {/* v0.9.0 — Beta */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">v0.9.0</h2>
          <span className="text-xs font-mono bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-0.5 rounded">
            Beta
          </span>
          <span className="text-sm text-slate-500">2025-12-01</span>
        </div>
        <p className="text-slate-400 text-sm">
          Public beta launch — opened to early-access customers with access to
          AI-powered features and expanded audit capabilities.
        </p>
        <ul className="space-y-2 text-sm text-slate-400 list-none pl-0">
          {[
            "AI Assistant — natural-language querying of threat data and asset inventory",
            "AI-generated incident summaries with recommended remediation steps",
            "Audit logs — query and export a full record of API and dashboard activity",
            "Audit log streaming to external SIEM via webhooks",
            "Expanded threat intelligence coverage — 40 new rule categories added",
            "Portfolio management API — track aggregate risk across asset groups",
            "Python SDK async client released (asyncio / aiohttp)",
            "Rate limiting infrastructure deployed — Free 100 req/min, Pro 1,000 req/min",
            "Dashboard redesign with dark mode and customisable widgets",
            "Bulk asset import via CSV and JSON",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-blue-400 mt-0.5 shrink-0">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4 text-sm text-amber-200 space-y-1">
          <p className="font-semibold">Breaking changes from v0.8.0</p>
          <ul className="space-y-1 pl-4 list-disc text-amber-300">
            <li>
              <code className="bg-black/30 px-1 rounded">GET /v1/events</code> renamed to{" "}
              <code className="bg-black/30 px-1 rounded">GET /v2/audit-logs</code>
            </li>
            <li>
              Threat severity values changed from integers to strings (
              <code className="bg-black/30 px-1 rounded">critical</code>,{" "}
              <code className="bg-black/30 px-1 rounded">high</code>,{" "}
              <code className="bg-black/30 px-1 rounded">medium</code>,{" "}
              <code className="bg-black/30 px-1 rounded">low</code>)
            </li>
          </ul>
        </div>
      </section>

      <hr className="border-slate-800" />

      {/* v0.8.0 — Alpha */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">v0.8.0</h2>
          <span className="text-xs font-mono bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded">
            Alpha
          </span>
          <span className="text-sm text-slate-500">2025-10-15</span>
        </div>
        <p className="text-slate-400 text-sm">
          First alpha release — internal and invite-only. Establishes the
          foundational authentication infrastructure and admin tooling.
        </p>
        <ul className="space-y-2 text-sm text-slate-400 list-none pl-0">
          {[
            "Core authentication — API key issuance and Bearer token validation",
            "Admin panel — organisation setup, user invitation, and role assignment",
            "Initial REST API surface — organisations, users, and basic asset CRUD",
            "Webhook registration endpoint (v1 — no signature verification yet)",
            "Node.js SDK v0.1.0 — synchronous API client only",
            "Python SDK v0.1.0 — synchronous API client only",
            "Go SDK v0.1.0 — idiomatic Go client with context support",
            "Developer sandbox environment with seeded test data",
            "OpenAPI 3.1 specification published",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-slate-500 mt-0.5 shrink-0">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-400">
          <p className="font-semibold text-slate-300">Alpha stability notice</p>
          <p className="mt-1">
            The v0.8.0 API is not stable. Endpoints, field names, and response
            shapes changed between patch releases. Do not use this version in
            production.
          </p>
        </div>
      </section>
    </main>
  );
}
