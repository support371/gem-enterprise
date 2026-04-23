import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Code2,
  Shield,
  Zap,
  Terminal,
  Key,
  Webhook,
  Database,
  FileText,
  ArrowRight,
  Search,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  Globe,
  Lock,
  Users,
  BarChart3,
  Settings,
  Cpu,
  Layers,
} from 'lucide-react'

export const metadata = { title: 'Documentation' }

const quickStartGuides = [
  {
    icon: Zap,
    title: 'Getting Started',
    description: 'Set up your environment and make your first API call in under 5 minutes.',
    href: '/docs/quickstart',
    time: '5 min',
  },
  {
    icon: Key,
    title: 'Authentication',
    description: 'Learn about API keys, OAuth 2.0, and secure authentication patterns.',
    href: '/docs/authentication',
    time: '8 min',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Configure real-time event notifications for your integrations.',
    href: '/docs/webhooks',
    time: '10 min',
  },
  {
    icon: Shield,
    title: 'Security Best Practices',
    description: 'Implement secure coding practices when integrating with GEM APIs.',
    href: '/docs/security',
    time: '12 min',
  },
]

const apiReferences = [
  {
    icon: AlertTriangle,
    title: 'Threat Intelligence API',
    description: 'Access real-time threat feeds, IOC data, and adversary profiles.',
    endpoints: 12,
    href: '/docs/api/threats',
    badge: 'Core',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    icon: Database,
    title: 'Asset Management API',
    description: 'Register, monitor, and manage protected assets across your organization.',
    endpoints: 18,
    href: '/docs/api/assets',
    badge: 'Core',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    icon: CheckCircle,
    title: 'Compliance API',
    description: 'Automate compliance checks, evidence collection, and audit reporting.',
    endpoints: 9,
    href: '/docs/api/compliance',
    badge: 'Enterprise',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  {
    icon: Users,
    title: 'Identity & Access API',
    description: 'Manage users, roles, permissions, and access policies programmatically.',
    endpoints: 15,
    href: '/docs/api/identity',
    badge: 'Core',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting API',
    description: 'Query security metrics, generate reports, and export audit logs.',
    endpoints: 8,
    href: '/docs/api/analytics',
    badge: 'Pro',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    icon: Globe,
    title: 'Webhooks & Events API',
    description: 'Subscribe to events and configure webhook delivery endpoints.',
    endpoints: 6,
    href: '/docs/api/webhooks',
    badge: 'Core',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
]

const sdks = [
  { name: 'Node.js / TypeScript', version: 'v2.4.0', href: '/docs/sdk/node', icon: '🟢' },
  { name: 'Python', version: 'v2.3.1', href: '/docs/sdk/python', icon: '🐍' },
  { name: 'Go', version: 'v1.8.0', href: '/docs/sdk/go', icon: '🔵' },
  { name: 'Ruby', version: 'v1.5.2', href: '/docs/sdk/ruby', icon: '💎' },
  { name: 'Java', version: 'v2.1.0', href: '/docs/sdk/java', icon: '☕' },
  { name: '.NET / C#', version: 'v1.9.0', href: '/docs/sdk/dotnet', icon: '🔷' },
]

const additionalResources = [
  { icon: FileText, title: 'Changelog', description: 'Latest updates and release notes', href: '/docs/changelog' },
  { icon: Lock, title: 'Rate Limits', description: 'API rate limiting and quotas', href: '/docs/rate-limits' },
  { icon: Settings, title: 'Error Codes', description: 'Complete error reference', href: '/docs/errors' },
  { icon: Cpu, title: 'Architecture', description: 'System architecture overview', href: '/docs/architecture' },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 md:py-20 cyber-grid overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase">
              Documentation
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            GEM Enterprise <span className="text-gradient-primary">Documentation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Everything you need to integrate GEM Enterprise security services into your applications.
            Comprehensive guides, API references, and SDK documentation.
          </p>

          {/* Search */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-10 bg-card/80 border-border/50 h-12"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-muted/50 border border-border/50 rounded text-xs font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Quick Start Guides */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Quick Start Guides</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/docs/guides">
                All Guides <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStartGuides.map((guide) => {
              const Icon = guide.icon
              return (
                <Link key={guide.title} href={guide.href}>
                  <Card className="glass-panel border-border/50 hover:border-primary/50 transition-all cursor-pointer h-full group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {guide.time}
                        </div>
                      </div>
                      <CardTitle className="text-sm mt-3 group-hover:text-primary transition-colors">
                        {guide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs leading-relaxed">
                        {guide.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* API Reference */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">API Reference</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/api-explorer">
                Open API Explorer <Terminal className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiReferences.map((api) => {
              const Icon = api.icon
              return (
                <Link key={api.title} href={api.href}>
                  <Card className="glass-panel border-border/50 hover:border-primary/50 transition-all cursor-pointer h-full group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge className={`text-xs ${api.badgeColor}`}>{api.badge}</Badge>
                      </div>
                      <CardTitle className="text-sm mt-3 group-hover:text-primary transition-colors">
                        {api.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs leading-relaxed mb-3">
                        {api.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">
                          {api.endpoints} endpoints
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* SDKs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Official SDKs</h2>
            </div>
          </div>
          <Card className="glass-panel border-border/50">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-border/30">
                {sdks.map((sdk) => (
                  <Link
                    key={sdk.name}
                    href={sdk.href}
                    className="flex flex-col items-center justify-center p-6 hover:bg-muted/30 transition-colors group"
                  >
                    <span className="text-2xl mb-2">{sdk.icon}</span>
                    <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                      {sdk.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground mt-1">{sdk.version}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Code Example */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Example: Fetch Threat Intelligence</h2>
          </div>
          <Card className="glass-panel border-border/50 overflow-hidden">
            <div className="bg-card/80 px-4 py-2 border-b border-border/40 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-xs text-muted-foreground ml-2">threats.ts</span>
            </div>
            <CardContent className="p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">
                <code>
                  <span className="text-purple-400">import</span> {'{ GemClient }'} <span className="text-purple-400">from</span> <span className="text-green-400">&apos;@gem-enterprise/sdk&apos;</span>{'\n'}
                  {'\n'}
                  <span className="text-muted-foreground">// Initialize the client</span>{'\n'}
                  <span className="text-purple-400">const</span> gem = <span className="text-purple-400">new</span> <span className="text-cyan-400">GemClient</span>({'{\n'}
                  {'  '}apiKey: process.env.<span className="text-amber-400">GEM_API_KEY</span>,{'\n'}
                  {'  '}environment: <span className="text-green-400">&apos;production&apos;</span>{'\n'}
                  {'}'}){'\n'}
                  {'\n'}
                  <span className="text-muted-foreground">// Fetch latest threat intelligence</span>{'\n'}
                  <span className="text-purple-400">const</span> threats = <span className="text-purple-400">await</span> gem.threats.<span className="text-cyan-400">list</span>({'{\n'}
                  {'  '}severity: [<span className="text-green-400">&apos;critical&apos;</span>, <span className="text-green-400">&apos;high&apos;</span>],{'\n'}
                  {'  '}sector: <span className="text-green-400">&apos;financial&apos;</span>,{'\n'}
                  {'  '}since: <span className="text-purple-400">new</span> <span className="text-cyan-400">Date</span>(<span className="text-green-400">&apos;2026-01-01&apos;</span>),{'\n'}
                  {'  '}limit: <span className="text-amber-400">50</span>{'\n'}
                  {'}'}){'\n'}
                  {'\n'}
                  <span className="text-purple-400">for</span> (<span className="text-purple-400">const</span> threat <span className="text-purple-400">of</span> threats.data) {'{\n'}
                  {'  '}console.<span className="text-cyan-400">log</span>(<span className="text-green-400">`[${'{'}</span>threat.severity<span className="text-green-400">{'}'}</span><span className="text-green-400">] ${'{'}</span>threat.title<span className="text-green-400">{'}'}</span><span className="text-green-400">`</span>){'\n'}
                  {'}'}
                </code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Additional Resources */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Additional Resources</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {additionalResources.map((resource) => {
              const Icon = resource.icon
              return (
                <Link key={resource.title} href={resource.href}>
                  <Card className="glass-panel border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Support CTA */}
        <section className="pb-8">
          <Card className="glass-panel border-primary/20 bg-primary/5">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground">
                    Our developer support team is available to help you integrate.
                    Contact us at{' '}
                    <a href="mailto:developers@gemcybersecurityassist.com" className="text-primary hover:underline">
                      developers@gemcybersecurityassist.com
                    </a>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" asChild>
                    <Link href="https://github.com/gem-enterprise" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/developers">
                      Developer Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
