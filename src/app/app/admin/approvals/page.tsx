'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ClipboardList, Clock, AlertCircle, CheckCircle, DollarSign, Shield, Building2, Scale, ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react'
import Link from 'next/link'

type ApprovalDomain = 'financial' | 'cyber' | 'realty' | 'legal'
type ApprovalPriority = 'urgent' | 'normal' | 'low'

interface Approval {
  id: string
  title: string
  domain: ApprovalDomain
  priority: ApprovalPriority
  requestedBy: string
  requestedAt: string
  description: string
  amount?: string
}

const approvals: Approval[] = [
  { id: 'APR-0087', title: 'Portfolio Rebalance — Meridian Holdings',   domain: 'financial', priority: 'urgent', requestedBy: 'Portfolio Mgr',  requestedAt: '2026-03-17', description: 'Reallocate 10% from Cybersecurity to Real Estate allocation.', amount: '$250,000' },
  { id: 'APR-0086', title: 'Refund Authorization — #INV-2048',          domain: 'financial', priority: 'urgent', requestedBy: 'Billing',         requestedAt: '2026-03-17', description: 'Client disputed billing for Q1 CyberShield service fee.',        amount: '$4,800' },
  { id: 'APR-0085', title: 'Incident Closure — SEC-Breach #7',          domain: 'cyber',     priority: 'urgent', requestedBy: 'SOC Lead',         requestedAt: '2026-03-16', description: 'Final approval for incident closure and evidence archiving.' },
  { id: 'APR-0084', title: 'Property Deal Disclosure — 44 Elm Street',  domain: 'realty',    priority: 'normal', requestedBy: 'ATR Advisor',      requestedAt: '2026-03-16', description: 'Client disclosure notice requires sign-off before transaction proceeds.' },
  { id: 'APR-0083', title: 'Legal Engagement — Westfield Trust',        domain: 'legal',     priority: 'normal', requestedBy: 'Legal Intake',     requestedAt: '2026-03-15', description: 'Matter intake requires conflict check clearance before assignment.' },
  { id: 'APR-0082', title: 'Penetration Test Scope Change',             domain: 'cyber',     priority: 'normal', requestedBy: 'Security Eng.',    requestedAt: '2026-03-14', description: 'Expanded scope to include cloud infrastructure at client request.' },
  { id: 'APR-0081', title: 'Fee Adjustment — CyberShield Pro Renewal',  domain: 'financial', priority: 'low',    requestedBy: 'Account Mgmt',     requestedAt: '2026-03-13', description: 'Client negotiated 5% discount for multi-year renewal.',            amount: '$14,400' },
]

const domainConfig: Record<ApprovalDomain, { icon: typeof DollarSign; colorText: string; colorBg: string; cardClass: string }> = {
  financial: { icon: DollarSign, colorText: 'text-[hsl(var(--svc-financial))]', colorBg: 'bg-[hsl(var(--svc-financial-muted))]', cardClass: 'svc-financial-card' },
  cyber:     { icon: Shield,     colorText: 'text-[hsl(var(--svc-cyber))]',     colorBg: 'bg-[hsl(var(--svc-cyber-muted))]',     cardClass: 'svc-cyber-card' },
  realty:    { icon: Building2,  colorText: 'text-[hsl(var(--svc-realty))]',    colorBg: 'bg-[hsl(var(--svc-realty-muted))]',    cardClass: 'svc-realty-card' },
  legal:     { icon: Scale,      colorText: 'text-violet-400',                  colorBg: 'bg-violet-500/10',                     cardClass: '' },
}

const priorityConfig: Record<ApprovalPriority, { color: string; bg: string }> = {
  urgent: { color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25' },
  normal: { color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25' },
  low:    { color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/25' },
}

export default function ApprovalsPage() {
  const [actioned, setActioned] = useState<Set<string>>(new Set())

  const remaining = approvals.filter(a => !actioned.has(a.id))
  const urgent    = remaining.filter(a => a.priority === 'urgent')

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/app/admin">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Approvals</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Human review gate — decisions that cannot be delegated to automation.
          </p>
        </div>
      </div>

      {urgent.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">{urgent.length} urgent approval{urgent.length > 1 ? 's' : ''} require immediate action</p>
            <p className="text-xs text-red-400 mt-0.5">Financial controls, security closures, and regulated decisions cannot remain open.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending', value: remaining.length, color: 'text-white' },
          { label: 'Urgent',        value: remaining.filter(a => a.priority === 'urgent').length, color: 'text-red-400' },
          { label: 'Financial',     value: remaining.filter(a => a.domain === 'financial').length, color: 'text-[hsl(var(--svc-financial))]' },
          { label: 'Actioned Today',value: actioned.size, color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 bento-card text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {remaining.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-xl">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-white font-semibold">All caught up</p>
            <p className="text-slate-400 text-sm mt-1">No pending approvals.</p>
          </div>
        ) : (
          remaining.map(item => {
            const { icon: Icon, colorText, colorBg, cardClass } = domainConfig[item.domain]
            const { color: priColor, bg: priBg } = priorityConfig[item.priority]
            return (
              <div key={item.id} className={`glass-panel rounded-xl p-5 bento-card ${cardClass}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg ${colorBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${colorText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <p className="text-xs text-slate-500 font-mono">{item.id}</p>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`${priBg} ${priColor} text-xs capitalize`}>{item.priority}</Badge>
                        {item.amount && (
                          <Badge className="bg-white/5 text-slate-300 border-white/10 text-xs font-mono">{item.amount}</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.requestedAt} · {item.requestedBy}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 gap-1.5 text-xs"
                          onClick={() => setActioned(prev => new Set(prev).add(item.id))}
                        >
                          <ThumbsUp className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0 gap-1.5 text-xs"
                          onClick={() => setActioned(prev => new Set(prev).add(item.id))}
                        >
                          <ThumbsDown className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
