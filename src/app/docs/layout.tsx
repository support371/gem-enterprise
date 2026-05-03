import Link from 'next/link'
import { BookOpen, Zap, Key, Webhook, Shield, AlertTriangle, Database, CheckCircle, Users, BarChart3, Globe, FileText, Lock, Settings, Cpu, Layers, ChevronRight } from 'lucide-react'

const nav = [
  {
    title: 'Getting Started',
    items: [
      { href: '/docs/quickstart', label: 'Quickstart', icon: Zap },
      { href: '/docs/authentication', label: 'Authentication', icon: Key },
      { href: '/docs/guides', label: 'Guides', icon: BookOpen },
      { href: '/docs/architecture', label: 'Architecture', icon: Cpu },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { href: '/docs/api/threats', label: 'Threat Intelligence', icon: AlertTriangle },
      { href: '/docs/api/assets', label: 'Asset Management', icon: Database },
      { href: '/docs/api/compliance', label: 'Compliance', icon: CheckCircle },
      { href: '/docs/api/identity', label: 'Identity & Access', icon: Users },
      { href: '/docs/api/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/docs/api/webhooks', label: 'Webhooks API', icon: Globe },
    ],
  },
  {
    title: 'SDKs',
    items: [
      { href: '/docs/sdk/node', label: 'Node.js / TypeScript', icon: Layers },
      { href: '/docs/sdk/python', label: 'Python', icon: Layers },
      { href: '/docs/sdk/go', label: 'Go', icon: Layers },
      { href: '/docs/sdk/ruby', label: 'Ruby', icon: Layers },
      { href: '/docs/sdk/java', label: 'Java', icon: Layers },
      { href: '/docs/sdk/dotnet', label: '.NET / C#', icon: Layers },
    ],
  },
  {
    title: 'Platform',
    items: [
      { href: '/docs/webhooks', label: 'Webhooks', icon: Webhook },
      { href: '/docs/security', label: 'Security', icon: Shield },
      { href: '/docs/rate-limits', label: 'Rate Limits', icon: Lock },
      { href: '/docs/errors', label: 'Error Codes', icon: Settings },
      { href: '/docs/changelog', label: 'Changelog', icon: FileText },
    ],
  },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-white/10 bg-black/20 sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <Link href="/docs" className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Documentation
          </Link>
        </div>
        <nav className="p-3 space-y-4 flex-1">
          {nav.map(section => (
            <div key={section.title}>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 mb-1">{section.title}</p>
              {section.items.map(item => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
