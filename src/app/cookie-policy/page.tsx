import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | GEM Enterprise",
  description: "Cookie categories, purposes, security controls, and consent choices for GEM Enterprise.",
};

const categories = [
  {
    name: "Essential",
    purpose: "Authentication, session security, load balancing, and form integrity.",
    consent: "Required to operate the platform.",
  },
  {
    name: "Security",
    purpose: "Abuse prevention, audit evidence, fraud detection, and protected-client access controls.",
    consent: "Required for secured services.",
  },
  {
    name: "Preferences",
    purpose: "Remembering non-sensitive interface choices.",
    consent: "Optional where implemented.",
  },
  {
    name: "Analytics",
    purpose: "Aggregate performance and usage measurement when analytics is enabled.",
    consent: "Non-essential and subject to applicable consent requirements.",
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Legal</p>
      <h1 className="mt-3 text-4xl font-bold">Cookie Policy</h1>
      <p className="mt-5 max-w-3xl leading-7 text-slate-300">
        GEM Enterprise uses limited cookies and similar technologies to operate a secure, authenticated platform. Cookies are not used to sell personal information.
      </p>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-white/10 text-white">
            <tr>
              <th className="p-4">Category</th>
              <th className="p-4">Purpose</th>
              <th className="p-4">Consent</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((row) => (
              <tr key={row.name} className="border-t border-white/10">
                <td className="p-4 font-semibold text-cyan-200">{row.name}</td>
                <td className="p-4 text-slate-300">{row.purpose}</td>
                <td className="p-4 text-slate-300">{row.consent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Session security</h2>
        <p className="leading-7 text-slate-300">
          The authenticated portal uses the <code className="rounded bg-white/10 px-1">gem_session</code> cookie with HttpOnly, SameSite=Lax, and Secure enabled in production.
        </p>
        <h2 className="pt-4 text-2xl font-semibold">Managing preferences</h2>
        <p className="leading-7 text-slate-300">
          Non-essential technologies must remain disabled until the required consent is available. Privacy requests can be sent to privacy@gemcybersecurityassist.com.
        </p>
      </section>
    </main>
  );
}
