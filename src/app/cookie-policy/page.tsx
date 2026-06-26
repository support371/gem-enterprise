import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | GEM Enterprise",
  description:
    "GEM Enterprise cookie categories, purposes, consent choices, and withdrawal instructions.",
};

const cookieRows: { category: string; purpose: string; examples: string; consent: string }[] = [
  {
    category: "Essential",
    purpose:
      "Core platform operations — authentication sessions, load balancing, CSRF protection, and form integrity validation.",
    examples: "gem_session, __cf_bm, _csrf",
    consent: "Required. These cookies cannot be disabled without breaking platform functionality.",
  },
  {
    category: "Security",
    purpose:
      "Abuse prevention, fraud detection, audit evidence trails, and KYC-gated access controls to protect clients and the platform.",
    examples: "gem_audit_ref, sec_challenge",
    consent: "Required for secured portal services.",
  },
  {
    category: "Preferences",
    purpose:
      "Remembering non-sensitive interface choices such as dismissed notices, theme settings, and session language preferences.",
    examples: "gem_prefs, notice_dismissed",
    consent: "Optional where implemented. Removing these cookies will reset your interface preferences.",
  },
  {
    category: "Analytics",
    purpose:
      "Aggregate, anonymised site performance and usage measurement via Vercel Analytics when enabled. No individual user profiles are built.",
    examples: "_vercel_analytics",
    consent:
      "Optional and non-essential. Deployed only in environments where consent is collected and honoured.",
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-20">
      {/* Header */}
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Legal</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight text-white">Cookie Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Effective: 1 January 2025 · Last updated: June 2026</p>
      <p className="mt-6 max-w-3xl text-slate-300 leading-relaxed">
        GEM Enterprise uses a minimal set of cookies and similar storage technologies strictly to
        operate a secure, KYC-gated platform. We do not use cookies to build advertising profiles,
        sell personal information, or track users across third-party sites.
      </p>

      {/* Cookie table */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Cookie categories</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-0 bg-white/10 text-xs font-semibold uppercase tracking-wide text-white">
            <div className="p-4">Category</div>
            <div className="p-4">Purpose</div>
            <div className="p-4">Examples</div>
            <div className="p-4">Consent basis</div>
          </div>
          {cookieRows.map((row, i) => (
            <div
              key={row.category}
              className={`grid grid-cols-4 gap-0 border-t border-white/10 text-sm ${
                i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
              }`}
            >
              <div className="p-4 font-semibold text-cyan-200">{row.category}</div>
              <div className="p-4 text-slate-300 leading-relaxed">{row.purpose}</div>
              <div className="p-4 text-slate-400 font-mono text-xs leading-relaxed">{row.examples}</div>
              <div className="p-4 text-slate-300 leading-relaxed">{row.consent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Session cookie detail */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Session cookie attributes</h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          The authenticated portal sets the <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-200">gem_session</code> cookie
          with the following security attributes:
        </p>
        <ul className="mt-4 space-y-2 text-slate-300 text-sm list-none">
          {[
            ["HttpOnly", "Prevents JavaScript access to the token."],
            ["Secure", "Transmitted only over HTTPS in production environments."],
            ["SameSite=Lax", "Limits cross-site transmission to protect against CSRF."],
            ["Path=/", "Scoped to the entire GEM Enterprise application."],
            ["Max-Age", "Short-lived. Expires at session end or after a fixed idle period."],
          ].map(([attr, desc]) => (
            <li key={attr} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <code className="text-cyan-200 text-xs font-mono w-36 shrink-0 pt-0.5">{attr}</code>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Consent & withdrawal */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Consent and withdrawal</h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Essential and security cookies are set only as needed to deliver the platform and
          authenticated portal. Non-essential cookies (Preferences, Analytics) are not deployed
          until consent has been obtained via the consent interface, where applicable.
        </p>
        <p className="mt-4 text-slate-300 leading-relaxed">
          You may withdraw consent or request removal of non-essential cookies at any time by:
        </p>
        <ul className="mt-4 space-y-2 text-slate-300 text-sm">
          {[
            "Using any consent control presented within the GEM Enterprise interface.",
            "Deleting cookies through your browser settings (does not affect server-side records).",
            "Emailing privacy@gemcybersecurityassist.com with the subject line \"Cookie consent withdrawal\".",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-cyan-300 mt-0.5 shrink-0">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Withdrawing consent for non-essential cookies does not affect the lawfulness of any
          processing carried out before withdrawal, nor does it prevent access to essential
          platform functionality.
        </p>
      </section>

      {/* Third parties */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Third-party technologies</h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Some cookies or similar technologies may be set by third-party subprocessors (such as
          cloud hosting or analytics providers) only where those services are active in a given
          deployment. GEM Enterprise does not control the cookie practices of external sites
          linked from this platform. Refer to each provider's privacy notice for details.
        </p>
      </section>

      {/* Policy changes */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Policy changes</h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          This policy may be updated to reflect changes to our technologies or legal obligations.
          Material changes will be communicated through the platform interface. The effective date
          at the top of this page indicates when the current version took effect.
        </p>
      </section>

      {/* Contact */}
      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">Cookie & privacy contact</h2>
        <p className="mt-3 text-slate-300 leading-relaxed">
          For questions about this Cookie Policy or to exercise your rights, contact the GEM
          Enterprise Privacy team:
        </p>
        <a
          href="mailto:privacy@gemcybersecurityassist.com"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-white/20 transition-colors"
        >
          privacy@gemcybersecurityassist.com
        </a>
      </section>
    </main>
  );
}
