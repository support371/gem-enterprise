import Link from 'next/link'
import {
  BookOpen,
  Zap,
  Key,
  Webhook,
  Shield,
  Terminal,
  ArrowRight,
  Clock,
  ExternalLink,
  Layers,
  Database,
  Globe,
} from 'lucide-react'

export const metadata = { title: 'Guides' }

const featuredGuides = [
  {
    icon: Zap,
    title: 'Quickstart',
    description:
      'Get from zero to your first authenticated API call in four steps. Covers account creation, KYC verification, API key generation, and a curl + TypeScript example.',
    href: '/docs/quickstart',
    time: '5 min',
    badge: 'Start Here',
    badgeColor: 'bg-green-400/10 text-green-400 border-green-400/30',
  },
  {
    icon: Key,
    title: 'Authentication',
    description:
      'Deep dive into both authentication methods: session JWT cookies for portal users and API key Bearer tokens for server integrations. Covers token expiry, revocation, and key rotation.',
    href: '/docs/authentication',
    time: '8 min',
    badge: 'Essential',
    badgeColor: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description:
      'Configure real-time event push notifications to your own HTTP endpoints. Learn about event types, payload signatures (HMAC-SHA256), retry logic, and delivery guarantees.',
    href: '/docs/webhooks',
    time: '10 min',
    badge: 'Integration',
    badgeColor: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
  },
  {
    icon: Shield,
    title: 'Security Best Practices',
    description:
      'Operational security guidance for integrators: TLS enforcement, secret management, IP allowlisting, rate limit handling, audit logging, and SOC 2 alignment considerations.',
    href: '/docs/security',
    time: '12 min',
    badge: 'Compliance',
    badgeColor: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  },
]

const architectureGuides = [
  {
    icon: Layers,
    title: 'System Architecture',
    description: 'Understand how GEM Enterprise is built: Next.js App Router, Prisma ORM, PostgreSQL, JWT auth pipeline, and Anthropic AI integration.',
    href: '/docs/architecture',
    time: '10 min',
  },
  {
    icon: Database,
    title: 'Data Residency',
    description: 'Learn where your data lives, how it is replicated, and which geographic regions are available for enterprise customers.',
    href: '/docs/architecture#data-residency',
    time: '4 min',
  },
  {
    icon: Globe,
    title: 'API Versioning',
    description: 'GEM APIs are versioned via the X-Gem-Version header. Understand our deprecation timeline and how to migrate between versions.',
    href: '/docs/api-versioning',
    time: '5 min',
  },
]

const apiCategories = [
  { title: 'Threat Intelligence API', endpoints: 12, href: '/docs/api/threats', badge: 'Core' },
  { title: 'Asset Management API', endpoints: 18, href: '/docs/api/assets', badge: 'Core' },
  { title: 'Compliance API', endpoints: 9, href: '/docs/api/compliance', badge: 'Enterprise' },
  { title: 'Identity & Access API', endpoints: 15, href: '/docs/api/identity', badge: 'Core' },
  { title: 'Analytics & Reporting API', endpoints: 8, href: '/docs/api/analytics', badge: 'Pro' },
  { title: 'Webhooks & Events API', endpoints: 6, href: '/docs/api/webhooks', badge: 'Core' },
]

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <BookOpen className="h-3 w-3" /> Guides
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Guides</h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
            Step-by-step guides covering integration, authentication, security, and the underlying system architecture. New guides are published with each major API release.
          </p>
        </div>

        {/* Featured Guides */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">Getting Started &amp; Core Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featuredGuides.map((guide) => {
              const Icon = guide.icon
              return (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${guide.badgeColor}`}>
                        {guide.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-white/40">
                        <Clock className="h-3 w-3" /> {guide.time}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2 flex items-center gap-1.5">
                    {guide.title} <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-white/55 leading-relaxed flex-1">{guide.description}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Architecture Guides */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">Architecture &amp; Infrastructure</h2>
          <div className="space-y-3">
            {architectureGuides.map((guide) => {
              const Icon = guide.icon
              return (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className="group flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">{guide.title}</p>
                    <p className="text-xs text-white/50 mt-0.5 truncate">{guide.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {guide.time}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* API Reference index */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">API Reference</h2>
            <Link
              href="/api-explorer"
              className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Terminal className="h-4 w-4" />
              Open API Explorer
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 font-medium text-white/70">API</th>
                  <th className="text-left px-4 py-3 font-medium text-white/70">Tier</th>
                  <th className="text-right px-4 py-3 font-medium text-white/70">Endpoints</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {apiCategories.map((api, idx) => (
                  <tr
                    key={api.title}
                    className={`group ${idx < apiCategories.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Link href={api.href} className="text-white group-hover:text-cyan-400 transition-colors font-medium">
                        {api.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-xs text-white/60">
                        {api.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-white/50">{api.endpoints}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={api.href}>
                        <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-cyan-400 transition-colors ml-auto" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA: API Explorer */}
        <section>
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Interactive API Explorer</h3>
              </div>
              <p className="text-sm text-white/60 max-w-md">
                Try any endpoint in your browser with your real API key. No client code required — see live responses instantly.
              </p>
            </div>
            <Link
              href="/api-explorer"
              className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-cyan-400 text-black font-medium text-sm px-5 py-2.5 hover:bg-cyan-300 transition-colors"
            >
              Open Explorer <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Footer nav */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <p className="text-sm text-white/40">
            Something missing? Email us at{' '}
            <a href="mailto:developers@gemcybersecurityassist.com" className="text-cyan-400 hover:underline">
              developers@gemcybersecurityassist.com
            </a>
          </p>
          <Link href="/docs" className="text-sm text-white/50 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            Back to Docs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  )
}
