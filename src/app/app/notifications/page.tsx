'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bell, CheckCircle2, AlertCircle, Clock, Shield, DollarSign,
  Building2, FileText, Activity, CheckCheck, X,
} from 'lucide-react'

type NotifLevel = 'info' | 'warning' | 'success' | 'critical'

interface Notification {
  id: string
  title: string
  body: string
  level: NotifLevel
  domain: 'cyber' | 'financial' | 'realty' | 'system'
  at: string
  read: boolean
  actionLabel?: string
  actionHref?: string
}

const initial: Notification[] = [
  {
    id: 'N-001', level: 'critical', domain: 'cyber',
    title: 'CyberShield Alert — Unresolved',
    body: 'Case GEM-2051 has been open for more than 24 hours without a resolution. Review required.',
    at: '30 min ago', read: false, actionLabel: 'View Case', actionHref: '/app/requests',
  },
  {
    id: 'N-002', level: 'warning', domain: 'financial',
    title: 'Approval Pending — Portfolio Rebalance',
    body: 'APR-0087 requires your acknowledgment before the rebalance can proceed.',
    at: '1h ago', read: false, actionLabel: 'View Approval', actionHref: '/app/admin/approvals',
  },
  {
    id: 'N-003', level: 'success', domain: 'financial',
    title: 'Q1 Statement Ready',
    body: 'Your Q1 2026 portfolio statement has been generated and is available for download.',
    at: '2h ago', read: false, actionLabel: 'Download', actionHref: '/app/documents',
  },
  {
    id: 'N-004', level: 'info', domain: 'realty',
    title: 'Title Search Update — 44 Elm Street',
    body: 'County records expected Thursday. No issues identified in preliminary review.',
    at: '3h ago', read: true,
  },
  {
    id: 'N-005', level: 'info', domain: 'cyber',
    title: 'Compliance Review Due',
    body: 'Control C-008 (Legal Matter Intake Controls) is overdue for review by April 1.',
    at: 'Yesterday', read: true, actionLabel: 'View Control', actionHref: '/app/compliance',
  },
  {
    id: 'N-006', level: 'success', domain: 'system',
    title: 'KYC Approved',
    body: 'Your identity verification was approved. Full platform access is now active.',
    at: '2 days ago', read: true,
  },
]

const levelConfig: Record<NotifLevel, { icon: typeof Bell; color: string; bg: string; ring: string }> = {
  critical: { icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-500/10',    ring: 'ring-1 ring-red-500/20' },
  warning:  { icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10', ring: '' },
  success:  { icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10',  ring: '' },
  info:     { icon: Bell,         color: 'text-[hsl(var(--svc-cyber))]', bg: 'bg-[hsl(var(--svc-cyber-muted))]', ring: '' },
}

const domainColors: Record<string, string> = {
  cyber:     'text-[hsl(var(--svc-cyber))]',
  financial: 'text-[hsl(var(--svc-financial))]',
  realty:    'text-[hsl(var(--svc-realty))]',
  system:    'text-slate-400',
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(initial)
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })))
  const dismiss     = (id: string) => setItems(prev => prev.filter(n => n.id !== id))
  const markRead    = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const displayed = filter === 'unread' ? items.filter(n => !n.read) : items
  const unreadCount = items.filter(n => !n.read).length

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-[hsl(var(--svc-cyber))]" />
            Notifications
            {unreadCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--svc-cyber))] text-black text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Alerts, approvals, and platform updates.</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/10 text-slate-300 hover:text-white gap-2" onClick={markAllRead}>
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </Button>
      </div>

      <div className="flex gap-2">
        {(['unread', 'all'] as const).map(f => (
          <Button
            key={f}
            variant="outline"
            size="sm"
            onClick={() => setFilter(f)}
            className={`border-white/10 text-xs ${filter === f ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {f === 'unread' ? `Unread (${unreadCount})` : 'All'}
          </Button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-white font-semibold">All caught up</p>
          <p className="text-slate-400 text-sm mt-1">No {filter === 'unread' ? 'unread' : ''} notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(n => {
            const { icon: Icon, color, bg, ring } = levelConfig[n.level]
            return (
              <div
                key={n.id}
                className={`glass-panel rounded-xl p-4 bento-card flex gap-3 ${ring} ${!n.read ? 'border-l-2 border-l-[hsl(var(--svc-cyber))]' : ''}`}
                onClick={() => markRead(n.id)}
              >
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{n.title}</p>
                      <p className={`text-[10px] capitalize ${domainColors[n.domain]}`}>{n.domain}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500">{n.at}</span>
                      <button
                        className="text-slate-500 hover:text-white transition-colors"
                        onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.body}</p>
                  {n.actionLabel && (
                    <a
                      href={n.actionHref}
                      className={`text-xs ${domainColors[n.domain]} hover:underline mt-2 inline-block`}
                      onClick={e => e.stopPropagation()}
                    >
                      {n.actionLabel} →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
