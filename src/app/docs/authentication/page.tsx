import Link from 'next/link'
import {
  Key,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
} from 'lucide-react'

export const metadata = { title: 'Authentication' }

export default function AuthenticationPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Key className="h-3 w-3" /> Authentication
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/50">
              <Clock className="h-3 w-3" /> 8 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Authentication</h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            GEM Enterprise supports two authentication methods: session-based JWT cookies for interactive users and API key authentication for programmatic access. Both are required to use HTTPS.
          </p>
        </div>

        {/* Overview table */}
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 font-medium text-white/70">Method</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Use Case</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Expiry</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Transport</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">Session JWT</td>
                <td className="px-4 py-3 text-white/60">Browser / portal login</td>
                <td className="px-4 py-3 text-white/60">7 days</td>
                <td className="px-4 py-3 text-white/60">HttpOnly cookie</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-cyan-400">API Key</td>
                <td className="px-4 py-3 text-white/60">Server-to-server, CI/CD</td>
                <td className="px-4 py-3 text-white/60">Never (manual revoke)</td>
                <td className="px-4 py-3 text-white/60">Authorization header</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Method A: Session JWT */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Method A — Session JWT Cookies</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            When a user authenticates through the portal UI, the server issues a signed JWT stored as an{' '}
            <span className="font-mono text-cyan-400">HttpOnly</span>,{' '}
            <span className="font-mono text-cyan-400">Secure</span>,{' '}
            <span className="font-mono text-cyan-400">SameSite=Strict</span> cookie. This cookie is automatically included by the browser on subsequent requests. The token is signed with an RS256 private key that rotates every 30 days.
          </p>

          <div className="space-y-4">
            <p className="text-sm font-medium text-white/70">Login request</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`POST /api/auth/login
Content-Type: application/json

{
  "email": "analyst@acme-corp.com",
  "password": "••••••••••••••••",
  "mfa_code": "482910"
}`}
            </pre>

            <p className="text-sm font-medium text-white/70">Successful response</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`HTTP/2 200 OK
Set-Cookie: gem_session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...; \\
  HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
Content-Type: application/json

{
  "user": {
    "id": "usr_01HXK4M2P9YJZQR8VWNE3FBD7",
    "email": "analyst@acme-corp.com",
    "role": "analyst",
    "org_id": "org_01HXJR9MQ4WKZNB5CVEFDLT28",
    "mfa_enabled": true
  },
  "session": {
    "issued_at": "2026-05-03T10:00:00Z",
    "expires_at": "2026-05-10T10:00:00Z"
  }
}`}
            </pre>

            <p className="text-sm font-medium text-white/70">Failed login (invalid credentials)</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`HTTP/2 401 Unauthorized
Content-Type: application/json

{
  "error": "invalid_credentials",
  "message": "Email or password is incorrect.",
  "request_id": "req_01HXKM2N3P4Q5R6S7T8U9V0W"
}`}
            </pre>
          </div>

          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-4 flex gap-3">
            <Info className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              MFA is mandatory for all accounts with <span className="font-mono text-cyan-400">admin</span> or <span className="font-mono text-cyan-400">analyst</span> roles. Time-based OTP (TOTP) via any RFC 6238-compliant authenticator app is supported.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Token refresh</p>
            <p className="text-white/60 text-sm leading-relaxed">
              Sessions are refreshed automatically on each authenticated request if the token has less than 24 hours remaining. To force a refresh explicitly:
            </p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`POST /api/auth/refresh
Cookie: gem_session=<current_token>

# Returns a new Set-Cookie header with a fresh 7-day token`}
            </pre>
          </div>
        </section>

        {/* Method B: API Key */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Key className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Method B — API Key Authentication</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            For server-side integrations, CI/CD pipelines, or any context where a browser session is unavailable, use API key authentication. Pass the key in the{' '}
            <span className="font-mono text-cyan-400">Authorization</span> header using the{' '}
            <span className="font-mono text-cyan-400">Bearer</span> scheme.
          </p>

          <div className="space-y-4">
            <p className="text-sm font-medium text-white/70">Request format</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`GET /api/threats
Authorization: Bearer gem_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Accept: application/json
X-Gem-Version: 2024-01`}
            </pre>

            <p className="text-sm font-medium text-white/70">API key anatomy</p>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-sm space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 shrink-0">gem_</span>
                <span className="text-white/50 text-xs mt-0.5">Constant prefix identifying GEM keys</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 shrink-0">live_</span>
                <span className="text-white/50 text-xs mt-0.5">Environment: <code>live</code> (production) or <code>test</code> (sandbox)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-300 shrink-0">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span>
                <span className="text-white/50 text-xs mt-0.5">32-byte cryptographically random identifier</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">TypeScript helper — authenticated fetch</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`// lib/gem-api.ts
const BASE = "https://api.gemcybersecurityassist.com";

export async function gemFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.GEM_API_KEY;
  if (!apiKey) throw new Error("GEM_API_KEY environment variable is not set");

  const res = await fetch(\`\${BASE}\${path}\`, {
    ...options,
    headers: {
      Authorization: \`Bearer \${apiKey}\`,
      "Content-Type": "application/json",
      "X-Gem-Version": "2024-01",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    throw new Error("API key is invalid or has been revoked");
  }
  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After") ?? "60";
    throw new Error(\`Rate limit exceeded. Retry after \${retryAfter}s\`);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(\`GEM API \${res.status}: \${body}\`);
  }

  return res.json() as Promise<T>;
}`}
            </pre>
          </div>
        </section>

        {/* Token expiry & revocation */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <RefreshCw className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Token Expiry &amp; Revocation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-2">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" /> Session JWT — 7 days
              </p>
              <p className="text-sm text-white/60">
                Sessions expire 7 days after issuance. Idle sessions shorter than 1 hour are extended automatically. Logging out immediately invalidates the token server-side via a denylist in Redis.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-2">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" /> API Keys — no automatic expiry
              </p>
              <p className="text-sm text-white/60">
                API keys do not expire automatically. Revoke them via the developer dashboard or the management API. We recommend rotating keys every 90 days as part of your security hygiene.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Revoke an API key via the management API</p>
            <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`DELETE /api/v1/developer/keys/key_01HXKM2N3P4Q5R6S7T8U9V0W
Authorization: Bearer gem_live_<admin_key>

# Response
HTTP/2 204 No Content`}
            </pre>
          </div>

          <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 flex gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/70">
              Revocation is immediate and irreversible. Any in-flight requests using the revoked key will complete, but no subsequent requests will be authenticated. Generate a replacement key before revoking the old one to avoid downtime.
            </p>
          </div>
        </section>

        {/* Security tips */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Security Tips</h2>
          </div>

          <ul className="space-y-3">
            {[
              { icon: EyeOff, text: 'Never commit API keys to source control. Use environment variables or a secrets manager such as AWS Secrets Manager, HashiCorp Vault, or Vercel environment variables.' },
              { icon: ShieldCheck, text: 'Scope API keys to the minimum required permissions. A key used only to read threats should not have write or admin scopes.' },
              { icon: RefreshCw, text: 'Rotate API keys every 90 days. Set a calendar reminder or automate rotation using your CI/CD pipeline.' },
              { icon: Clock, text: 'Monitor key usage via the developer dashboard. Unexpected spikes in API calls may indicate a compromised key.' },
              { icon: CheckCircle2, text: 'Enable MFA on all accounts. MFA is required for admin roles and strongly recommended for all other users.' },
              { icon: AlertTriangle, text: 'If a key is suspected to be compromised, revoke it immediately and audit the request logs for the preceding 30 days.' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 items-start">
                <Icon className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <h2 className="text-lg font-semibold">Related Guides</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { label: 'Quickstart', href: '/docs/quickstart', desc: 'Make your first API call' },
              { label: 'Security Policies', href: '/docs/security', desc: 'TLS, encryption, rate limits' },
              { label: 'Developer Dashboard', href: '/developers/security', desc: 'Manage your API keys' },
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
