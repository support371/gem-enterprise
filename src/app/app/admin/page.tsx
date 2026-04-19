'use client'

import Link from 'next/link'
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
} from 'lucide-react'

const adminModules = [
  {
    href:  '/app/admin/kyc',
    icon:  CheckCircle,
    label: 'KYC Queue',
    desc:  'Review pending identity verifications.',
    count: 4,
    countColor: 'text-yellow-400',
    colorText: 'text-[hsl(var(--svc-financial))]',
    colorBg:   'bg-[hsl(var(--svc-financial-muted))]',
    cardClass:  'svc-financial-card',
  },
  {
    href:  '/app/admin/approvals',
    icon:  ClipboardList,
    label: 'Approvals',
    desc:  'Pending decisions requiring admin sign-off.',
    count: 7,
    countColor: 'text-red-400',
    colorText: 'text-[hsl(var(--svc-cyber))]',
    colorBg:   'bg-[hsl(var(--svc-cyber-muted))]',
    cardClass:  'svc-cyber-card',
  },
  {
    href:  '/app/admin/users',
    icon:  Users,
    label: 'Users',
    desc:  'Manage client accounts, roles, and access.',
    count: 128,
    countColor: 'text-white',
    colorText: 'text-[hsl(var(--svc-realty))]',
    colorBg:   'bg-[hsl(var(--svc-realty-muted))]',
    cardClass:  'svc-realty-card',
  },
  {
    href:  '/app/admin/allocations',
    icon:  PieChart,
    label: 'Allocations',
    desc:  'Platform AUM and service allocation oversight.',
    count: null,
    countColor: '',
    colorText: 'text-green-400',
    colorBg:   'bg-green-500/10',
    cardClass:  '',
  },
]

const recentEvents = [
  { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-500/10',                              text: 'KYC approved — Priya Sharma',                 time: '12 min ago' },
  { icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-500/10',                                 text: 'Approval escalated — Investment allocation #38', time: '41 min ago' },
  { icon: Users,        color: 'text-[hsl(var(--svc-financial))]', bg: 'bg-[hsl(var(--svc-financial-muted))]', text: 'New user onboarded — Kwame Asante', time: '1h ago' },
  { icon: ShieldCheck,  color: 'text-[hsl(var(--svc-cyber))]',     bg: 'bg-[hsl(var(--svc-cyber-muted))]',     text: 'Compliance review signed off — C-007',         time: '2h ago' },
  { icon: FileText,     color: 'text-slate-400',  bg: 'bg-slate-500/10',                               text: 'Document uploaded — Q1 Portfolio Statement',  time: '3h ago' },
]

const platformStats = [
  { label: 'Total Users',       value: '128',      delta: '+3 this week', up: true,  icon: Users,       colorText: 'text-[hsl(var(--svc-cyber))]',      colorBg: 'bg-[hsl(var(--svc-cyber-muted))]' },
  { label: 'Pending KYC',       value: '4',        delta: '2 overdue',    up: false, icon: CheckCircle, colorText: 'text-yellow-400',                    colorBg: 'bg-yellow-500/10' },
  { label: 'Open Approvals',    value: '7',        delta: '3 urgent',     up: false, icon: ClipboardList, colorText: 'text-red-400',                    colorBg: 'bg-red-500/10' },
  { label: 'Platform AUM',      value: '$312M',    delta: '+4.2% MTD',    up: true,  icon: TrendingUp,  colorText: 'text-green-400',                    colorBg: 'bg-green-500/10' },
]

export default function AdminPage() {
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-[hsl(var(--svc-cyber))]" />
            Admin Center
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Platform operations, governance oversight, and client management.
          </p>
        </div>
        <Badge className="bg-[hsl(var(--svc-cyber-muted))] text-[hsl(var(--svc-cyber))] border-0 gap-1.5 px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--svc-cyber))] animate-pulse-slow inline-block" />
          Operations Live
        </Badge>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map(({ label, value, delta, up, icon: Icon, colorText, colorBg }) => (
          <div key={label} className="glass-panel rounded-xl p-5 bento-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${colorBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${colorText}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className={`text-xs flex items-center gap-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
              {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {delta}
            </p>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminModules.map(({ href, icon: Icon, label, desc, count, countColor, colorText, colorBg, cardClass }) => (
          <Link key={href} href={href}>
            <div className={`glass-panel rounded-xl p-5 bento-card h-full ${cardClass}`}>
              <div className={`w-10 h-10 rounded-lg ${colorBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${colorText}`} />
              </div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">{desc}</p>
              <div className="flex items-center justify-between">
                {count !== null && (
                  <span className={`text-2xl font-bold ${countColor}`}>{count}</span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Activity + system health */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
                Recent Admin Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.map(({ icon: Icon, color, bg, text, time }, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-3">
                    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className="flex-1 text-sm text-slate-300">{text}</p>
                    <span className="text-xs text-slate-500 shrink-0">{time}</span>
                  </div>
                  {i < recentEvents.length - 1 && <Separator className="bg-white/5" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Auth Service',    ok: true },
              { label: 'Database',        ok: true },
              { label: 'Storage',         ok: true },
              { label: 'Email / SMS',     ok: true },
              { label: 'AI Assistant',    ok: false, note: 'Degraded' },
              { label: 'Analytics',       ok: true },
            ].map(({ label, ok, note }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{label}</span>
                <Badge className={ok ? 'bg-green-500/15 text-green-400 border-green-500/25 text-xs' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25 text-xs'}>
                  {note ?? (ok ? 'Operational' : 'Down')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
