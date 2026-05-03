import Link from 'next/link'
import {
  Shield,
  Clock,
  Lock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Globe,
  BarChart3,
  FileText,
  ArrowRight,
  Eye,
  Key,
  Server,
} from 'lucide-react'

export const metadata = { title: 'Security Policies' }

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Shield className="h-3 w-3" /> Security
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/50">
              <Clock className="h-3 w-3" /> 12 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Security Policies</h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            GEM Enterprise is built with security as a first-order constraint. This document covers transport encryption, data-at-rest encryption, access controls, rate limiting, audit logging, and alignment with SOC 2 Type II requirements.
          </p>

          {/* SOC 2 note */}
          <div className="rounded-lg border border-green-400/20 bg-green-400/5 p-4 flex gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              GEM Enterprise has completed a SOC 2 Type II examination. The report is available to enterprise customers under NDA. Contact{' '}
              <a href="mailto:compliance@gemcybersecurityassist.com" className="text-green-400 hover:underline">
                compliance@gemcybersecurityassist.com
              </a>{' '}
              to request access.
            </p>
          </div>
        </div>

        {/* TLS */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Encryption in Transit — TLS 1.3</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            All communication with GEM Enterprise endpoints is encrypted using TLS 1.3. TLS 1.0 and 1.1 are disabled at the Vercel edge layer. TLS 1.2 is permitted only for legacy SDK compatibility and will be deprecated on 2027-01-01.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Protocol', value: 'TLS 1.3 (preferred), TLS 1.2 (legacy)' },
              { label: 'Cipher suites (TLS 1.3)', value: 'TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256' },
              { label: 'Certificate authority', value: "Let's Encrypt (ECDSA P-256)" },
              { label: 'HSTS', value: 'max-age=31536000; includeSubDomains; preload' },
              { label: 'Certificate pinning', value: 'Supported via X-Gem-Pin-Key response header (enterprise plan)' },
              { label: 'HTTP redirects', value: 'All HTTP traffic redirected to HTTPS with 301' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm text-white font-mono">{value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Verify TLS from the command line</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`# Check negotiated TLS version and cipher
curl -v --tlsv1.3 https://api.gemcybersecurityassist.com/api/health 2>&1 \\
  | grep -E "SSL connection|cipher"

# Expected output:
# * SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384`}
            </pre>
          </div>
        </section>

        {/* Encryption at rest */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Encryption at Rest — AES-256</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            All persistent data is encrypted at rest using AES-256. Encryption keys are managed via a dedicated Key Management Service (KMS) with automatic annual rotation. The application layer never has direct access to plaintext encryption keys; it holds only ephemeral data encryption keys (DEKs) wrapped by a KMS key encryption key (KEK).
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/70">Layer</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Algorithm</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Key Management</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['PostgreSQL volume', 'AES-256-GCM', 'Supabase managed KMS'],
                  ['S3 objects (audit logs)', 'AES-256 (SSE-KMS)', 'AWS KMS, annual rotation'],
                  ['PII fields (email, phone)', 'AES-256-GCM (field-level)', 'Application DEK + KMS KEK'],
                  ['API keys (stored)', 'bcrypt (cost 12) hash', 'One-way; plaintext never stored'],
                  ['JWT signing key', 'RSA-2048 private key', 'Rotated every 30 days'],
                ].map(([layer, algo, mgmt], idx) => (
                  <tr key={layer} className={idx < 4 ? 'border-b border-white/5' : ''}>
                    <td className="px-4 py-3 text-white">{layer}</td>
                    <td className="px-4 py-3 font-mono text-xs text-cyan-400">{algo}</td>
                    <td className="px-4 py-3 text-xs text-white/60">{mgmt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* IP allowlisting */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Server className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">IP Allowlisting</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            Enterprise plan customers can restrict API key usage to a pre-approved list of IP addresses or CIDR ranges. Requests originating from outside the allowlist are rejected at the Edge Middleware layer with a{' '}
            <span className="font-mono text-cyan-400">403 Forbidden</span> response before reaching application code.
          </p>
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Configure an allowlist via the management API</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`PATCH /api/v1/developer/keys/key_01HXKM2N3P4Q5R6S7T8U9V0W
Authorization: Bearer gem_live_<admin_key>
Content-Type: application/json

{
  "ip_allowlist": [
    "203.0.113.0/24",
    "198.51.100.42",
    "2001:db8::/32"
  ]
}

# Response
{
  "id": "key_01HXKM2N3P4Q5R6S7T8U9V0W",
  "label": "production-backend",
  "ip_allowlist": ["203.0.113.0/24", "198.51.100.42", "2001:db8::/32"],
  "updated_at": "2026-05-03T10:00:00Z"
}`}
            </pre>
          </div>
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-4 flex gap-3">
            <Eye className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              Vercel's serverless functions may originate from dynamic IPs. If your API key is called from Vercel functions, configure the allowlist to include Vercel's published IP ranges or disable IP allowlisting for that specific key and rely on scoped permissions instead.
            </p>
          </div>
        </section>

        {/* Rate limits */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Rate Limits</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            Rate limits are enforced per API key using a sliding window algorithm. Limits vary by plan tier. When a limit is exceeded the API returns{' '}
            <span className="font-mono text-cyan-400">429 Too Many Requests</span> with a{' '}
            <span className="font-mono text-cyan-400">Retry-After</span> header indicating when the next request may be made.
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/70">Plan</th>
                  <th className="text-right px-4 py-3 font-medium text-white/70">Requests / min</th>
                  <th className="text-right px-4 py-3 font-medium text-white/70">Requests / day</th>
                  <th className="text-right px-4 py-3 font-medium text-white/70">Burst allowance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Starter', '60', '10,000', '120 req / 10 s'],
                  ['Pro', '300', '100,000', '600 req / 10 s'],
                  ['Enterprise', '1,200', 'Unlimited', '2,400 req / 10 s'],
                ].map(([plan, rpm, rpd, burst], idx) => (
                  <tr key={plan} className={idx < 2 ? 'border-b border-white/5' : ''}>
                    <td className="px-4 py-3 font-medium text-white">{plan}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-white/70">{rpm}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-white/70">{rpd}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-white/70">{burst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Rate limit response headers</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`HTTP/2 429 Too Many Requests
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1746352860
Retry-After: 47
Content-Type: application/json

{
  "error": "rate_limit_exceeded",
  "message": "You have exceeded 300 requests per minute.",
  "retry_after_seconds": 47
}`}
            </pre>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Implementing exponential back-off in TypeScript</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  maxRetries = 4
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);

    if (res.status !== 429) {
      if (!res.ok) throw new Error(\`API error: \${res.status}\`);
      return res.json() as Promise<T>;
    }

    if (attempt === maxRetries) {
      throw new Error("Max retries exceeded after rate limit");
    }

    const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
    const jitter = Math.random() * 1000;
    const delay = retryAfter * 1000 * Math.pow(2, attempt) + jitter;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Unreachable");
}`}
            </pre>
          </div>
        </section>

        {/* API key rotation */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Key className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">API Key Rotation Recommendations</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            API keys do not expire automatically, but we strongly recommend a proactive rotation schedule to limit the blast radius of a compromised key. The following guidance is aligned with NIST SP 800-57 key management recommendations.
          </p>
          <ul className="space-y-3">
            {[
              { icon: RefreshCw, title: 'Rotate every 90 days', desc: 'Generate a new key, update all consumers, then revoke the old key. Overlap the new and old keys by at least 24 hours to avoid a hard cutover.' },
              { icon: AlertTriangle, title: 'Rotate immediately after personnel changes', desc: 'When a team member with API key access leaves the organization, rotate all keys they had access to on the same day.' },
              { icon: Eye, title: 'Rotate if key is suspected compromised', desc: 'If you observe unexpected API calls in the usage logs, revoke the affected key immediately and conduct a 30-day look-back audit.' },
              { icon: Key, title: 'Use separate keys per environment', desc: 'Maintain distinct keys for development, staging, and production. Never use a production key in a CI/CD pipeline.' },
              { icon: Server, title: 'Store keys in a secrets manager', desc: 'Use AWS Secrets Manager, HashiCorp Vault, or Vercel Environment Variables. Never hard-code keys in source files.' },
              { icon: CheckCircle2, title: 'Audit key usage monthly', desc: 'Review the developer dashboard for each key\'s last-used timestamp. Revoke any keys that have been dormant for 30+ days.' },
            ].map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <Icon className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-sm text-white/55 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Audit log retention */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Audit Log Retention</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            GEM Enterprise maintains comprehensive audit logs for all authentication events, data mutations, and administrative actions. The retention schedule below applies to all plans:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { period: '90 days', label: 'Hot storage', desc: 'Queryable via the API and dashboard. Full-text searchable. Sub-second latency.' },
              { period: '1 year', label: 'Warm archive', desc: 'Downloadable as JSON/CSV via the Compliance API. Retrieval within 1 minute.' },
              { period: '7 years', label: 'Cold archive (S3 Glacier)', desc: 'Available on written request for regulatory or legal discovery. Retrieval within 12 hours.' },
            ].map(({ period, label, desc }) => (
              <div key={period} className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-1">
                <p className="text-2xl font-bold text-cyan-400">{period}</p>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Export audit logs via the Compliance API</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`GET /api/v1/audit-logs?from=2026-04-01&to=2026-04-30&format=json
Authorization: Bearer gem_live_<admin_key>

# Returns a paginated list of audit events.
# Use ?format=csv to receive a CSV download link (valid for 1 hour).`}
            </pre>
          </div>
        </section>

        {/* SOC 2 alignment */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">SOC 2 Alignment</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            GEM Enterprise's controls are designed to align with the AICPA Trust Services Criteria used in SOC 2 Type II examinations. The following table maps key controls to the relevant TSC categories:
          </p>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/70">TSC Category</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Control</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Implementation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['CC6.1 — Logical Access', 'Authentication & authorization', 'JWT + RBAC + MFA enforcement'],
                  ['CC6.2 — Access Provisioning', 'Least-privilege scoping', 'Per-key permission scopes; admin approval for write access'],
                  ['CC6.6 — Network Security', 'Encryption in transit', 'TLS 1.3 enforced at Vercel edge'],
                  ['CC7.2 — System Monitoring', 'Anomaly detection', 'Real-time alerting on auth failures, rate spikes'],
                  ['CC9.2 — Vendor Management', 'Third-party risk', 'Anthropic DPA, Supabase SOC 2 Report, Vercel SOC 2 Report'],
                  ['A1.2 — Availability', 'Uptime target', '99.9% monthly SLA with status page at status.gemcybersecurityassist.com'],
                  ['C1.1 — Confidentiality', 'Data classification', 'PII encrypted at field level; tenant isolation via RLS'],
                  ['P4.1 — Data Retention', 'Retention schedule', 'Audit logs 90 days hot / 7 years archive; user data deletion on request'],
                ].map(([tsc, control, impl], idx) => (
                  <tr key={tsc} className={idx < 7 ? 'border-b border-white/5' : ''}>
                    <td className="px-4 py-3 font-mono text-xs text-cyan-400 whitespace-nowrap">{tsc}</td>
                    <td className="px-4 py-3 text-white text-xs">{control}</td>
                    <td className="px-4 py-3 text-white/55 text-xs">{impl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 flex gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              This table is for informational purposes only and does not constitute an assurance report. For the full SOC 2 Type II report, contact{' '}
              <a href="mailto:compliance@gemcybersecurityassist.com" className="text-amber-400 hover:underline">
                compliance@gemcybersecurityassist.com
              </a>.
            </p>
          </div>
        </section>

        {/* Responsible disclosure */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Responsible Disclosure</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            If you discover a security vulnerability in GEM Enterprise, please report it via our responsible disclosure program at{' '}
            <a href="mailto:security@gemcybersecurityassist.com" className="text-cyan-400 hover:underline">
              security@gemcybersecurityassist.com
            </a>. We acknowledge reports within 1 business day and aim to remediate critical issues within 7 days. We do not pursue legal action against researchers who follow responsible disclosure guidelines.
          </p>
        </section>

        {/* Related */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <h2 className="text-lg font-semibold">Related Guides</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { label: 'Authentication', href: '/docs/authentication', desc: 'JWT cookies, API key setup' },
              { label: 'System Architecture', href: '/docs/architecture', desc: 'How the platform is built' },
              { label: 'All Guides', href: '/docs/guides', desc: 'Browse the full index' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 p-4 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all group"
              >
                <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  {item.label} <ArrowRight className="h-3.5 w-3.5" />
                </p>
                <p className="text-xs text-white/50 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
