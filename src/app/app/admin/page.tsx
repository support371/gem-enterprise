'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { platformOrigins } from '@/lib/platform-origins'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  CheckCircle,
  ClipboardList,
  PieChart,
  Shield,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ShieldCheck,
  Rss,
  Database,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Network,
  UserCheck,
  Zap,
  ExternalLink,
  MonitorCog,
} from 'lucide-react'

const adminModules = [
  {
    href: '/app/admin/kyc',
    icon: CheckCircle,
    label: 'KYC Queue',
    desc: 'Review identity, entity, and document submissions.',
    count: 4,
    countColor: 'text-yellow-400',
    colorText: 'text-[hsl(var(--svc-financial))]',
    colorBg: 'bg-[hsl(var(--svc-financial-muted))]',
    cardClass: 'svc-financial-card',
  },
  {
    href: '/app/admin/approvals',
    icon: ClipboardList,
    label: 'Approvals',
    desc: 'Handle manual decisions and approval exceptions.',
    count: 7,
    countColor: 'text-red-400',
    colorText: 'text-[hsl(var(--svc-cyber))]',
    colorBg: 'bg-[hsl(var(--svc-cyber-muted))]',
    cardClass: 'svc-cyber-card',
  },
  {
    href: '/app/admin/users',
    icon: Users,
    label: 'Users',
    desc: 'Manage accounts, roles, status, and client access.',
    count: 128,
    countColor: 'text-white',
    colorText: 'text-[hsl(var(--svc-realty))]',
    colorBg: 'bg-[hsl(var(--svc-realty-muted))]',
    cardClass: 'svc-realty-card',
  },
  {
    href: '/app/admin/allocations',
    icon: PieChart,
    label: 'Allocations',
    desc: 'Review product access and portfolio-level exposure.',
    count: null,
    countColor: '',
    colorText: 'text-green-400',
    colorBg: 'bg-green-500/10',
    cardClass: '',
  },
  {
    href: '/app/admin/news',
    icon: Rss,
    label: 'News Ingestion',
    desc: 'Manage sources, AI summaries, and ingestion run history.',
    count: null,
    countColor: '',
    colorText: 'text-[hsl(var(--svc-cyber))]',
    colorBg: 'bg-[hsl(var(--svc-cyber-muted))]',
    cardClass: 'svc-cyber-card',
  },
]

const reviewQueues = [
  {
    label: 'Identity Verification',
    value: '4',
    caption: 'KYC files pending analyst review',
    icon: Fingerprint,
    className: 'text-yellow-400 bg-yellow-500/10',
  },
  {
    label: 'Manual Approvals',
    value: '7',
    caption: 'Requires admin decision before entitlement',
    icon: UserCheck,
    className: 'text-red-400 bg-red-500/10',
  },
  {
    label: 'Entitlement Changes',
    value: '3',
    caption: 'Product access updates awaiting validation',
    icon: KeyRound,
    className: 'text-[hsl(var(--svc-cyber))] bg-[hsl(var(--svc-cyber-muted))]',
  },
  {
    label: 'Evidence Events',
    value: '42',
    caption: 'Audit events captured during current review window',
    icon: Database,
    className: 'text-green-400 bg-green-500/10',
  },
]

const governanceControls = [
  {
    title: 'Access Gate',
    status: 'Active',
    description: 'Protected routes require authenticated sessions and approved access state.',
    icon: LockKeyhole,
  },
  {
    title: 'Compliance Evidence',
    status: 'Recording',
    description: 'KYC, approvals, support, and admin actions maintain traceable operational state.',
    icon: ShieldCheck,
  },
  {
    title: 'Ops Routing',
    status: 'Online',
    description: 'Queues route identity, entitlement, intelligence, and support decisions into admin surfaces.',
    icon: Network,
  },
]

const recentEvents = [
  { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', text: 'KYC approved — Priya Sharma', time: '12 min ago' },
  { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', text: 'Approval escalated — Investment allocation #38', time: '41 min ago' },
  { icon: Users, color: 'text-[hsl(var(--svc-financial))]', bg: 'bg-[hsl(var(--svc-financial-muted))]', text: 'New user onboarded — Kwame Asante', time: '1h ago' },
  { icon: ShieldCheck, color: 'text-[hsl(var(--svc-cyber))]', bg: 'bg-[hsl(var(--svc-cyber-muted))]', text: 'Compliance review signed off — C-007', time: '2h ago' },
  { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10', text: 'Document uploaded — Q1 Portfolio Statement', time: '3h ago' },
]

interface AdminStats {
  totalUsers: number
  pendingKyc: number
  openApprovals: number
  openTickets: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
  }, [])

  const platformStats = [
    { label: 'Total Users', value: stats ? String(stats.totalUsers) : '—', delta: 'active accounts', up: true, icon: Users, colorText: 'text-[hsl(var(--svc-cyber))]', colorBg: 'bg-[hsl(var(--svc-cyber-muted))]' },
    { label: 'Pending KYC', value: stats ? String(stats.pendingKyc) : '—', delta: 'awaiting review', up: false, icon: CheckCircle, colorText: 'text-yellow-400', colorBg: 'bg-yellow-500/10' },
    { label: 'Open Approvals', value: stats ? String(stats.openApprovals) : '—', delta: 'manual review', up: false, icon: ClipboardList, colorText: 'text-red-400', colorBg: 'bg-red-500/10' },
    { label: 'Open Tickets', value: stats ? String(stats.openTickets) : '—', delta: 'support queue', up: false, icon: TrendingUp, colorText: 'text-green-400', colorBg: 'bg-green-500/10' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-[hsl(var(--svc-cyber))]">
            <Activity className="h-3 w-3" />
            Operations Command
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Shield className="h-6 w-6 text-[hsl(var(--svc-cyber))]" />
            Admin Center
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Platform governance, verification queues, entitlement control, support escalation, and operational audit visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="gap-1.5 border-0 bg-[hsl(var(--svc-cyber-muted))] px-3 py-1 text-[hsl(var(--svc-cyber))]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--svc-cyber))] animate-pulse-slow" />
            Operations Live
          </Badge>
          <Badge className="gap-1.5 border-green-500/25 bg-green-500/15 px-3 py-1 text-green-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Audit Ready
          </Badge>
          <Button asChild className="gap-2 bg-[hsl(var(--svc-cyber))] text-slate-950 hover:bg-[hsl(var(--svc-cyber))]/90">
            <a
              href={platformOrigins.adminCommandCenter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the protected GEM Enterprise Command Center"
            >
              <MonitorCog className="h-4 w-4" />
              Enterprise Command Center
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {platformStats.map(({ label, value, delta, up, icon: Icon, colorText, colorBg }) => (
          <div key={label} className="glass-panel bento-card flex flex-col gap-3 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorBg}`}>
                <Icon className={`h-4 w-4 ${colorText}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className={`flex items-center gap-1 text-xs ${up ? 'text-green-400' : 'text-red-400'}`}>
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reviewQueues.map(({ label, value, caption, icon: Icon, className }) => {
          const [textClass, bgClass] = className.split(' ')

          return (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgClass}`}>
                  <Icon className={`h-5 w-5 ${textClass}`} />
                </div>
                <p className="font-mono text-2xl font-bold text-white">{value}</p>
              </div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{caption}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {adminModules.map(({ href, icon: Icon, label, desc, count, countColor, colorText, colorBg, cardClass }) => (
          <Link key={href} href={href}>
            <div className={`glass-panel bento-card h-full rounded-xl p-5 ${cardClass}`}>
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${colorBg}`}>
                <Icon className={`h-5 w-5 ${colorText}`} />
              </div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="mb-4 mt-1 text-xs text-slate-400">{desc}</p>
              <div className="flex items-center justify-between">
                {count !== null && <span className={`text-2xl font-bold ${countColor}`}>{count}</span>}
                <ChevronRight className="ml-auto h-4 w-4 text-slate-500" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-white">
              <Activity className="h-4 w-4 text-[hsl(var(--svc-cyber))]" />
              Recent Admin Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.map(({ icon: Icon, color, bg, text, time }, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 py-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className="flex-1 text-sm text-slate-300">{text}</p>
                  <span className="shrink-0 text-xs text-slate-500">{time}</span>
                </div>
                {i < recentEvents.length - 1 && <Separator className="bg-white/5" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {governanceControls.map(({ title, status, description, icon: Icon }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[hsl(var(--svc-cyber))]" />
                  <p className="text-sm font-semibold text-white">{title}</p>
                </div>
                <Badge className="border-green-500/25 bg-green-500/15 text-xs text-green-400">{status}</Badge>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-white/10 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-white">
            <Zap className="h-4 w-4 text-[hsl(var(--svc-realty))]" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Auth Service', ok: true },
            { label: 'Database', ok: true },
            { label: 'Storage', ok: true },
            { label: 'Email / SMS', ok: true },
            { label: 'AI Assistant', ok: false, note: 'Degraded' },
            { label: 'Analytics', ok: true },
          ].map(({ label, ok, note }) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm text-slate-300">{label}</span>
              <Badge className={ok ? 'border-green-500/25 bg-green-500/15 text-xs text-green-400' : 'border-yellow-500/25 bg-yellow-500/15 text-xs text-yellow-400'}>
                {note ?? (ok ? 'Operational' : 'Down')}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
    </svg>
  )
}
