'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Code2,
  Key,
  Activity,
  Terminal,
  BookOpen,
  Zap,
  Shield,
  Copy,
  Eye,
  EyeOff,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Globe,
  Webhook,
  RefreshCw,
  Trash2,
} from 'lucide-react'

const apiKeys = [
  { id: 'key_1', name: 'Production API Key', key: 'gem_live_sk_1a2b3c4d5e6f7g8h9i0j', created: 'Jan 15, 2026', lastUsed: '2 hours ago', status: 'active' },
  { id: 'key_2', name: 'Development Key', key: 'gem_test_sk_9z8y7x6w5v4u3t2s1r0q', created: 'Feb 20, 2026', lastUsed: '5 days ago', status: 'active' },
  { id: 'key_3', name: 'Staging Environment', key: 'gem_test_sk_staging_abc123def456', created: 'Mar 1, 2026', lastUsed: 'Never', status: 'inactive' },
]

const usageMetrics = [
  { label: 'API Calls (This Month)', value: '47,832', limit: '100,000', percent: 48, trend: '+12.3%' },
  { label: 'Webhooks Delivered', value: '3,421', limit: '10,000', percent: 34, trend: '+8.7%' },
  { label: 'Data Transfer', value: '2.4 GB', limit: '10 GB', percent: 24, trend: '-2.1%' },
  { label: 'Active Integrations', value: '7', limit: '15', percent: 47, trend: '+2' },
]

const recentActivity = [
  { time: '2 min ago', event: 'API Request', endpoint: '/v1/threats/feed', status: 'success', latency: '124ms' },
  { time: '5 min ago', event: 'Webhook Sent', endpoint: 'incident.created', status: 'success', latency: '89ms' },
  { time: '12 min ago', event: 'API Request', endpoint: '/v1/assets/list', status: 'success', latency: '201ms' },
  { time: '18 min ago', event: 'API Request', endpoint: '/v1/compliance/check', status: 'error', latency: '—' },
  { time: '25 min ago', event: 'Webhook Sent', endpoint: 'alert.triggered', status: 'success', latency: '67ms' },
]

const quickLinks = [
  { icon: BookOpen, label: 'Documentation', href: '/docs', description: 'Complete API reference and guides' },
  { icon: Terminal, label: 'API Explorer', href: '/api-explorer', description: 'Interactive API testing console' },
  { icon: Webhook, label: 'Webhooks', href: '/developers/webhooks', description: 'Configure event notifications' },
  { icon: Shield, label: 'Security', href: '/developers/security', description: 'Best practices and authentication' },
]

export default function DeveloperDashboardPage() {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyKey = (keyId: string, keyValue: string) => {
    navigator.clipboard.writeText(keyValue)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '••••••••••••••••'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 cyber-grid overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Code2 className="h-6 w-6" />
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30 font-mono text-xs tracking-widest uppercase">
              Developer Portal
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Developer <span className="text-gradient-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage your API keys, monitor usage, and integrate GEM Enterprise security services into your applications.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.label} href={link.href}>
                <Card className="glass-panel border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Usage Metrics */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Usage Overview</h2>
            </div>
            <Badge variant="outline" className="font-mono text-xs">April 2026</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {usageMetrics.map((metric) => (
              <Card key={metric.label} className="glass-panel border-border/50">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">{metric.label}</p>
                  <div className="flex items-end justify-between mb-3">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <span className={`text-xs font-mono ${metric.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.trend}
                    </span>
                  </div>
                  <Progress value={metric.percent} className="h-1.5 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {metric.value} of {metric.limit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* API Keys */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">API Keys</h2>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
          <Card className="glass-panel border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Key</TableHead>
                    <TableHead className="text-muted-foreground">Created</TableHead>
                    <TableHead className="text-muted-foreground">Last Used</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id} className="border-border/30 hover:bg-muted/30">
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                            {visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys[apiKey.id] ? (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyKey(apiKey.id, apiKey.key)}
                          >
                            {copiedKey === apiKey.id ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{apiKey.created}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{apiKey.lastUsed}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            apiKey.status === 'active'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          }
                        >
                          {apiKey.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400">
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-3">
            Keep your API keys secure. Never share them in public repositories or client-side code.
          </p>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/developers/logs">
                View All Logs <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <Card className="glass-panel border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Event</TableHead>
                    <TableHead className="text-muted-foreground">Endpoint</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity, idx) => (
                    <TableRow key={idx} className="border-border/30 hover:bg-muted/30">
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {activity.time}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{activity.event}</TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                          {activity.endpoint}
                        </code>
                      </TableCell>
                      <TableCell>
                        {activity.status === 'success' ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {activity.latency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Getting Started */}
        <section>
          <Card className="glass-panel border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quick Start Guide</CardTitle>
                  <CardDescription>Get up and running with the GEM API in minutes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-card/80 rounded-lg border border-border/50 p-4 font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground mb-2"># Install the SDK</div>
                <div className="text-primary mb-4">npm install @gem-enterprise/sdk</div>
                <div className="text-muted-foreground mb-2"># Initialize the client</div>
                <div className="text-foreground">
                  <span className="text-purple-400">import</span> {'{ GemClient }'} <span className="text-purple-400">from</span> <span className="text-green-400">&apos;@gem-enterprise/sdk&apos;</span>
                </div>
                <div className="text-foreground mt-2">
                  <span className="text-purple-400">const</span> gem = <span className="text-purple-400">new</span> <span className="text-cyan-400">GemClient</span>(<span className="text-green-400">&apos;your_api_key&apos;</span>)
                </div>
                <div className="text-foreground mt-4">
                  <span className="text-muted-foreground">// Fetch threat intelligence</span>
                </div>
                <div className="text-foreground">
                  <span className="text-purple-400">const</span> threats = <span className="text-purple-400">await</span> gem.threats.<span className="text-cyan-400">list</span>()
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/docs/quickstart">
                    Read Full Guide <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/api-explorer">Try API Explorer</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support */}
        <section className="pb-8">
          <Card className="glass-panel border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Need Help?</p>
                    <p className="text-sm text-muted-foreground">
                      Contact developer support at{' '}
                      <a href="mailto:developers@gemcybersecurityassist.com" className="text-primary hover:underline">
                        developers@gemcybersecurityassist.com
                      </a>{' '}
                      or call{' '}
                      <a href="tel:+14017022460" className="text-primary hover:underline">
                        +1 (401) 702-2460
                      </a>
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
