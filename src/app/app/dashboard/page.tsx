'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Package,
  FileText,
  ClipboardList,
  Bell,
  Briefcase,
  Upload,
  Send,
  PhoneCall,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Building2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react'

// ── Data ────────────────────────────────────────────────────────────────────

const stats = [
  {
    label: 'Active Products',
    value: '4',
    delta: '+1 this month',
    up: true,
    icon: Package,
    colorClass: 'text-[hsl(var(--svc-cyber))]',
    bgClass:    'bg-[hsl(var(--svc-cyber-muted))]',
  },
  {
    label: 'Documents',
    value: '8',
    delta: '+2 this month',
    up: true,
    icon: FileText,
    colorClass: 'text-[hsl(var(--svc-financial))]',
    bgClass:    'bg-[hsl(var(--svc-financial-muted))]',
  },
  {
    label: 'Open Requests',
    value: '2',
    delta: 'Avg 48h resolution',
    up: null,
    icon: ClipboardList,
    colorClass: 'text-[hsl(var(--svc-realty))]',
    bgClass:    'bg-[hsl(var(--svc-realty-muted))]',
  },
  {
    label: 'Notifications',
    value: '3',
    delta: '1 requires action',
    up: false,
    icon: Bell,
    colorClass: 'text-red-400',
    bgClass:    'bg-red-500/10',
  },
]

const services = [
  {
    id: 'cyber',
    label: 'Cybersecurity',
    icon: Shield,
    allocation: 45,
    value: '$1,125,000',
    status: 'Operational',
    statusOk: true,
    metrics: [
      { label: 'Threats blocked', value: '2,847', delta: '+12%' },
      { label: 'Uptime',          value: '99.98%', delta: '' },
    ],
    colorText:  'text-[hsl(var(--svc-cyber))]',
    colorBg:    'bg-[hsl(var(--svc-cyber-muted))]',
    fillClass:  'progress-fill-cyber',
    cardClass:  'svc-cyber-card',
  },
  {
    id: 'financial',
    label: 'Financial Security',
    icon: DollarSign,
    allocation: 35,
    value: '$875,000',
    status: 'Operational',
    statusOk: true,
    metrics: [
      { label: 'YTD return',  value: '+8.4%', delta: '+2.1%' },
      { label: 'Risk score',  value: 'Low',   delta: '' },
    ],
    colorText:  'text-[hsl(var(--svc-financial))]',
    colorBg:    'bg-[hsl(var(--svc-financial-muted))]',
    fillClass:  'progress-fill-financial',
    cardClass:  'svc-financial-card',
  },
  {
    id: 'realty',
    label: 'Real Estate',
    icon: Building2,
    allocation: 20,
    value: '$500,000',
    status: 'Review',
    statusOk: false,
    metrics: [
      { label: 'Properties',   value: '2',     delta: '' },
      { label: 'Rental yield', value: '6.2%',  delta: '+0.3%' },
    ],
    colorText:  'text-[hsl(var(--svc-realty))]',
    colorBg:    'bg-[hsl(var(--svc-realty-muted))]',
    fillClass:  'progress-fill-realty',
    cardClass:  'svc-realty-card',
  },
]

const activityFeed = [
  {
    id: 1,
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    title: 'KYC Approved',
    desc: 'Identity verification successfully approved.',
    time: '2 days ago',
  },
  {
    id: 2,
    icon: FileText,
    color: 'text-[hsl(var(--svc-cyber))]',
    bg: 'bg-[hsl(var(--svc-cyber-muted))]',
    title: 'Document Viewed',
    desc: 'Q1 Portfolio Statement accessed.',
    time: '3 days ago',
  },
  {
    id: 3,
    icon: Package,
    color: 'text-[hsl(var(--svc-financial))]',
    bg: 'bg-[hsl(var(--svc-financial-muted))]',
    title: 'Product Activated',
    desc: 'CyberShield Pro activated on your account.',
    time: '5 days ago',
  },
  {
    id: 4,
    icon: AlertCircle,
    color: 'text-[hsl(var(--svc-realty))]',
    bg: 'bg-[hsl(var(--svc-realty-muted))]',
    title: 'Support Ticket Opened',
    desc: 'Ticket #GEM-2048 — portfolio access query.',
    time: '1 week ago',
  },
  {
    id: 5,
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    title: 'Allocation Rebalanced',
    desc: 'Portfolio allocation updated per your advisor.',
    time: '2 weeks ago',
  },
]

const quickActions = [
  { label: 'Upload Document', icon: Upload,   href: '/app/documents', colorClass: 'text-[hsl(var(--svc-cyber))]' },
  { label: 'Submit Request',  icon: Send,     href: '/app/requests',  colorClass: 'text-[hsl(var(--svc-financial))]' },
  { label: 'Contact Advisor', icon: PhoneCall, href: '/app/support',  colorClass: 'text-[hsl(var(--svc-realty))]' },
  { label: 'View Products',   icon: Eye,      href: '/app/products',  colorClass: 'text-green-400' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning,{' '}
            <span className="text-gradient-primary">Valued Client</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            GEM Enterprise account overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Badge className="bg-green-500/15 text-green-400 border-green-500/25 gap-1.5 px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow inline-block" />
          All Systems Active
        </Badge>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, up, icon: Icon, colorClass, bgClass }) => (
          <div key={label} className="glass-panel rounded-xl p-5 bento-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className={`text-xs flex items-center gap-1 ${up === true ? 'text-green-400' : up === false ? 'text-red-400' : 'text-slate-500'}`}>
              {up === true && <ArrowUpRight className="w-3 h-3" />}
              {up === false && <ArrowDownRight className="w-3 h-3" />}
              {delta}
            </p>
          </div>
        ))}
      </div>

      {/* ── Services performance + quick actions ──────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Services — takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Service Performance</h2>
            <Link href="/app/products" className="text-xs text-[hsl(var(--svc-cyber))] hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {services.map(({ id, label, icon: Icon, allocation, value, status, statusOk, metrics, colorText, colorBg, fillClass, cardClass }) => (
            <div key={id} className={`glass-panel rounded-xl p-5 bento-card ${cardClass}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${colorBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colorText}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className={`text-xs ${colorText} font-mono`}>{value}</p>
                  </div>
                </div>
                <Badge className={statusOk ? 'bg-green-500/15 text-green-400 border-green-500/25 text-xs' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25 text-xs'}>
                  {statusOk ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {status}
                </Badge>
              </div>

              {/* Allocation bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Portfolio allocation</span>
                  <span className={`font-semibold ${colorText}`}>{allocation}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`h-full rounded-full ${fillClass}`}
                    style={{ width: `${allocation}%` }}
                  />
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3">
                {metrics.map(({ label: ml, value: mv, delta }) => (
                  <div key={ml} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400">{ml}</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {mv}
                      {delta && (
                        <span className="text-xs text-green-400 ml-1.5">{delta}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Portfolio total */}
          <Card className="bg-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Briefcase className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
                Total Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">Total Value</p>
                <p className="text-2xl font-bold text-[hsl(var(--svc-cyber))] mt-0.5">$2,500,000</p>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {services.map(({ id, label, allocation, fillClass }) => (
                  <div key={id} className="text-center">
                    <div className="progress-track mb-1">
                      <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${allocation}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{label.split(' ')[0]}</p>
                    <p className="text-xs font-semibold text-white">{allocation}%</p>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Last updated</span>
                <span className="text-slate-300">Mar 15, 2026</span>
              </div>
              <Link href="/app/portfolios">
                <Button variant="outline" size="sm" className="w-full border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs">
                  View Full Portfolio
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="bg-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-[hsl(var(--svc-realty))]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {quickActions.map(({ label, icon: Icon, href, colorClass }) => (
                <Link key={label} href={href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs"
                  >
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                    {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Compliance */}
          <div className="glass-panel rounded-xl p-4 svc-cyber-card">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <p className="text-sm font-semibold text-white">Compliance Status</p>
            </div>
            <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-xs mb-2">
              All requirements met
            </Badge>
            <p className="text-xs text-slate-400">
              No outstanding compliance items. Next review: Q2 2026.
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent activity ───────────────────────────────────── */}
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
              Recent Activity
            </CardTitle>
            <Link href="/app/notifications" className="text-xs text-[hsl(var(--svc-cyber))] hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {activityFeed.map(({ id, icon: Icon, color, bg, title, desc, time }, idx) => (
              <div key={id}>
                <div className="flex items-start gap-3 py-3">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 pt-0.5">{time}</span>
                </div>
                {idx < activityFeed.length - 1 && <Separator className="bg-white/5" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
