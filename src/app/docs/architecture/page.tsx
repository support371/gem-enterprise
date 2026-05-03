import Link from 'next/link'
import {
  Layers,
  Clock,
  Database,
  Shield,
  Cpu,
  Globe,
  Lock,
  ArrowRight,
  Server,
  GitBranch,
  BarChart3,
  HardDrive,
} from 'lucide-react'

export const metadata = { title: 'System Architecture' }

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Layers className="h-3 w-3" /> Architecture
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/50">
              <Clock className="h-3 w-3" /> 10 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">System Architecture</h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            An overview of how GEM Enterprise is designed and deployed: the technology stack, request flow, data layer, AI integration, and operational principles.
          </p>
        </div>

        {/* Stack overview */}
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold">Technology Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Globe, label: 'Frontend & API', value: 'Next.js 16 (App Router)', detail: 'React Server Components, streaming SSR, Edge Middleware' },
              { icon: Database, label: 'Database', value: 'PostgreSQL 16', detail: 'Managed on Supabase; connection pooling via PgBouncer' },
              { icon: Server, label: 'ORM', value: 'Prisma 5', detail: 'Type-safe query builder, schema migrations, seeding' },
              { icon: Lock, label: 'Authentication', value: 'JWT (RS256) + Sessions', detail: 'Issued by /api/auth/login; stored as HttpOnly cookies' },
              { icon: Cpu, label: 'AI Integration', value: 'Anthropic Claude', detail: 'Threat summarization, anomaly narrative, document analysis' },
              { icon: Globe, label: 'Deployment', value: 'Vercel (Edge + Serverless)', detail: 'Global CDN, instant rollbacks, preview deployments per PR' },
              { icon: GitBranch, label: 'CI/CD', value: 'GitHub Actions + Vercel', detail: 'Type-check, lint, test, preview deploy on each pull request' },
              { icon: BarChart3, label: 'Observability', value: 'Vercel Analytics + Logs', detail: 'Real-time logs, speed insights, error tracking via Sentry' },
            ].map(({ icon: Icon, label, value, detail }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
                <p className="font-semibold text-white">{value}</p>
                <p className="text-xs text-white/50">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Layer diagram */}
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold">Request Flow &amp; Layer Diagram</h2>
          <p className="text-white/60 leading-relaxed">
            Every inbound request passes through the following layers before data is returned. Each layer is independently testable and maintains a single responsibility.
          </p>
          <pre className="bg-black/40 rounded-lg p-6 overflow-x-auto font-mono text-sm text-green-300">
{`
  ┌──────────────────────────────────────────────────────────────┐
  │                    Vercel Edge Network                        │
  │   TLS 1.3 termination · DDoS mitigation · CDN caching        │
  └──────────────────────────┬───────────────────────────────────┘
                             │ HTTPS
  ┌──────────────────────────▼───────────────────────────────────┐
  │                    Next.js Middleware                          │
  │   Auth gate · IP allowlist check · Rate limit header inject   │
  └──────────────────────────┬───────────────────────────────────┘
                             │
  ┌──────────────────────────▼───────────────────────────────────┐
  │                   Auth Layer                                   │
  │   JWT verify (RS256) · API key lookup · Session hydration     │
  │   MFA assertion · RBAC permission check                       │
  └──────────────────────────┬───────────────────────────────────┘
                             │ req.user attached
  ┌──────────────────────────▼───────────────────────────────────┐
  │               Next.js API Route Handler                        │
  │   Input validation (Zod) · Response serialization             │
  │   Error normalization · Audit event emit                      │
  └──────────────────────────┬───────────────────────────────────┘
                             │
  ┌──────────────────────────▼───────────────────────────────────┐
  │                  Business Logic Layer                          │
  │   Domain services · AI enrichment (Anthropic) · Caching       │
  │   Event bus · Background job scheduling (Vercel Cron)         │
  └──────────────────────────┬───────────────────────────────────┘
                             │
  ┌──────────────────────────▼───────────────────────────────────┐
  │                  Prisma ORM Layer                              │
  │   Schema enforcement · Query optimization · Soft deletes      │
  │   Transaction management · Audit field population             │
  └──────────────────────────┬───────────────────────────────────┘
                             │ SQL over TLS
  ┌──────────────────────────▼───────────────────────────────────┐
  │              PostgreSQL 16 (Supabase)                          │
  │   Row-level security (RLS) · Encrypted at rest (AES-256)      │
  │   Point-in-time recovery · 7-day WAL archive                  │
  └──────────────────────────────────────────────────────────────┘
`}
          </pre>
        </section>

        {/* Auth layer detail */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Auth Layer</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            The auth layer is implemented in Next.js Middleware and runs on the Vercel Edge Network before any serverless function is invoked. This means unauthenticated requests are rejected at the CDN edge, reducing compute costs and eliminating any path to unauthenticated business logic.
          </p>
          <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`// middleware.ts (simplified)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";
import { resolveApiKey } from "@/lib/auth/api-keys";

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const sessionCookie = req.cookies.get("gem_session")?.value;

  let principal: Principal | null = null;

  if (authHeader?.startsWith("Bearer gem_")) {
    principal = await resolveApiKey(authHeader.slice(7));
  } else if (sessionCookie) {
    principal = await verifyJwt(sessionCookie);
  }

  if (!principal) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Attach principal to request headers for downstream handlers
  const res = NextResponse.next();
  res.headers.set("x-gem-principal-id", principal.id);
  res.headers.set("x-gem-principal-role", principal.role);
  return res;
}`}
          </pre>
        </section>

        {/* Prisma ORM */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Prisma ORM &amp; PostgreSQL</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            All database access is mediated through Prisma Client, which provides compile-time type safety and prevents SQL injection by construction. Migrations are version-controlled in <span className="font-mono text-cyan-400">prisma/migrations/</span> and applied atomically during deployments.
          </p>
          <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`// Example: paginated threat query with Prisma
const threats = await prisma.threat.findMany({
  where: {
    severity: { in: ["CRITICAL", "HIGH"] },
    orgId: principal.orgId,
    deletedAt: null,          // soft-delete filter
  },
  select: {
    id: true,
    title: true,
    severity: true,
    category: true,
    firstSeen: true,
    lastSeen: true,
    confidence: true,
    _count: { select: { iocs: true } },
  },
  orderBy: { lastSeen: "desc" },
  take: limit,
  skip: (page - 1) * limit,
});`}
          </pre>
          <p className="text-white/60 text-sm leading-relaxed">
            Row-level security (RLS) policies in PostgreSQL enforce multi-tenant data isolation independently of the application layer, providing a defence-in-depth guarantee that one organization can never read another organization's data even if application-level access controls are bypassed.
          </p>
        </section>

        {/* AI Integration */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Cpu className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Anthropic AI Integration</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            GEM Enterprise uses the Anthropic Claude API to enrich raw threat data with human-readable summaries, auto-classify IOC clusters, and generate recommended remediation steps. AI calls are made server-side only; no raw customer data is sent to Anthropic without explicit operator consent.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Threat Summarization', desc: 'Converts raw feed data into executive-readable summaries with MITRE ATT&CK mapping' },
              { label: 'Anomaly Narrative', desc: 'Explains behavioral anomalies in natural language for Tier-1 SOC triage' },
              { label: 'Document Analysis', desc: 'Extracts IOCs and risk indicators from unstructured PDF/HTML threat reports' },
            ].map(({ label, desc }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-1">
                <p className="text-sm font-semibold text-cyan-400">{label}</p>
                <p className="text-xs text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data residency */}
        <section id="data-residency" className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <HardDrive className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Data Residency &amp; Encryption</h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/70">Data Type</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Primary Region</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Encryption at Rest</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">In Transit</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Threat intelligence', 'us-east-1', 'AES-256 (Supabase managed)', 'TLS 1.3'],
                  ['User & org records', 'us-east-1', 'AES-256 + field-level encryption (PII)', 'TLS 1.3'],
                  ['Audit logs', 'us-east-1', 'AES-256 (S3 SSE)', 'TLS 1.3'],
                  ['File attachments', 'us-east-1', 'AES-256 (S3 SSE-KMS)', 'TLS 1.3'],
                  ['AI request payloads', 'Anthropic US', 'AES-256 (provider managed)', 'TLS 1.3'],
                ].map(([type, region, enc, transit], idx, arr) => (
                  <tr key={type} className={idx < arr.length - 1 ? 'border-b border-white/5' : ''}>
                    <td className="px-4 py-3 text-white">{type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{region}</td>
                    <td className="px-4 py-3 text-xs text-white/60">{enc}</td>
                    <td className="px-4 py-3 text-xs text-white/60">{transit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Audit logging */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Shield className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Audit Logging</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            Every mutating API request generates an immutable audit event stored in a separate append-only table. Audit records include the actor, action, affected resource, IP address, and a diff of changed fields. Logs are retained for 90 days in hot storage and archived to S3 for a further 7 years to support compliance requirements.
          </p>
          <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-300">
{`// Audit event structure
{
  "id": "aud_01HXKM2N3P4Q5R6S7T8U9V0W",
  "timestamp": "2026-05-03T10:00:00.000Z",
  "actor": {
    "id": "usr_01HXK4M2P9YJ...",
    "email": "analyst@acme-corp.com",
    "ip": "203.0.113.45",
    "user_agent": "Mozilla/5.0 ..."
  },
  "action": "threat.update",
  "resource": {
    "type": "threat",
    "id": "thr_01HXK4M2P9YJ..."
  },
  "diff": {
    "severity": { "from": "high", "to": "critical" }
  },
  "request_id": "req_01HXKM2N3P4Q5R6S7T8U9V0W",
  "org_id": "org_01HXJR9MQ4WK..."
}`}
          </pre>
        </section>

        {/* Vercel deployment */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-semibold">Vercel Deployment Model</h2>
          </div>
          <p className="text-white/60 leading-relaxed">
            GEM Enterprise is deployed to Vercel's Enterprise tier. Static and RSC-rendered pages are served from Vercel's global edge network (300+ PoPs). API routes are deployed as serverless functions in the <span className="font-mono text-cyan-400">iad1</span> (US East) region to minimize latency to the primary PostgreSQL instance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Zero-downtime deploys', desc: 'Blue/green deployment with automatic rollback on error rate spike' },
              { label: 'Preview environments', desc: 'Every pull request gets a unique preview URL for QA and stakeholder review' },
              { label: 'Edge Middleware', desc: 'Auth checks and redirects run at the CDN edge before any origin request' },
              { label: 'Cron jobs', desc: 'Vercel Cron handles scheduled tasks: threat feed refresh, report generation, key expiry checks' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="h-2 w-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/50 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <h2 className="text-lg font-semibold">Related Guides</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { label: 'Security Policies', href: '/docs/security', desc: 'TLS, rate limits, key rotation' },
              { label: 'Authentication', href: '/docs/authentication', desc: 'JWT and API key details' },
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
