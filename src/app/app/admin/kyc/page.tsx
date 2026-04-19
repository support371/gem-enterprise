'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, AlertCircle, User, FileText, Eye, ThumbsUp, ThumbsDown, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type KycStatus = 'pending' | 'in_review' | 'flagged' | 'approved' | 'rejected'

interface KycCase {
  id: string
  clientName: string
  clientType: 'individual' | 'business' | 'family-office' | 'trust'
  submittedAt: string
  status: KycStatus
  documentsCount: number
  reviewer: string | null
  flagReason?: string
}

const kycCases: KycCase[] = [
  { id: 'KYC-2048', clientName: 'Priya Sharma',       clientType: 'individual',    submittedAt: '2026-03-15', status: 'in_review', documentsCount: 4, reviewer: 'Admin' },
  { id: 'KYC-2047', clientName: 'Nexus Capital LLC',  clientType: 'business',      submittedAt: '2026-03-14', status: 'pending',   documentsCount: 6, reviewer: null },
  { id: 'KYC-2046', clientName: 'Kwame Asante',       clientType: 'individual',    submittedAt: '2026-03-13', status: 'flagged',   documentsCount: 3, reviewer: 'Admin', flagReason: 'PEP match — manual review required.' },
  { id: 'KYC-2045', clientName: 'Westfield Trust',    clientType: 'trust',         submittedAt: '2026-03-12', status: 'pending',   documentsCount: 7, reviewer: null },
  { id: 'KYC-2044', clientName: 'Meridian Holdings',  clientType: 'family-office', submittedAt: '2026-03-10', status: 'approved',  documentsCount: 8, reviewer: 'J. Martinez' },
  { id: 'KYC-2043', clientName: 'Sara Okonkwo',       clientType: 'individual',    submittedAt: '2026-03-08', status: 'rejected',  documentsCount: 2, reviewer: 'K. Osei', flagReason: 'Insufficient ID documentation.' },
]

const statusConfig: Record<KycStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  pending:   { label: 'Pending',   color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/25',  icon: Clock },
  in_review: { label: 'In Review', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25', icon: Eye },
  flagged:   { label: 'Flagged',   color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25',       icon: AlertCircle },
  approved:  { label: 'Approved',  color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/25',   icon: CheckCircle },
  rejected:  { label: 'Rejected',  color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25',       icon: AlertCircle },
}

const typeColors: Record<KycCase['clientType'], string> = {
  individual:    'text-[hsl(var(--svc-cyber))]',
  business:      'text-[hsl(var(--svc-financial))]',
  'family-office': 'text-[hsl(var(--svc-realty))]',
  trust:         'text-violet-400',
}

export default function KycQueuePage() {
  const [selected, setSelected] = useState<KycCase | null>(null)
  const pending   = kycCases.filter(c => c.status === 'pending' || c.status === 'in_review' || c.status === 'flagged')
  const completed = kycCases.filter(c => c.status === 'approved' || c.status === 'rejected')

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/app/admin">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Queue</h1>
          <p className="text-slate-400 text-sm mt-0.5">Review and action identity verification submissions.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: kycCases.filter(c => c.status === 'pending').length, color: 'text-slate-300' },
          { label: 'In Review',      value: kycCases.filter(c => c.status === 'in_review').length, color: 'text-yellow-400' },
          { label: 'Flagged',        value: kycCases.filter(c => c.status === 'flagged').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 text-center bento-card">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className={`grid gap-6 ${selected ? 'lg:grid-cols-2' : ''}`}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Action Required ({pending.length})</p>
          {pending.map(kase => {
            const { label, color, bg, icon: StatusIcon } = statusConfig[kase.status]
            return (
              <div
                key={kase.id}
                className={`glass-panel rounded-xl p-4 bento-card cursor-pointer svc-financial-card ${selected?.id === kase.id ? 'ring-1 ring-white/20' : ''}`}
                onClick={() => setSelected(kase)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{kase.clientName}</p>
                      <p className={`text-xs ${typeColors[kase.clientType]} capitalize`}>{kase.clientType.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <Badge className={`${bg} ${color} text-xs flex items-center gap-1`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {label}
                  </Badge>
                </div>
                {kase.flagReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 mb-3">
                    <p className="text-xs text-red-300"><AlertCircle className="w-3 h-3 inline mr-1" />{kase.flagReason}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{kase.id}</span>
                  <span><FileText className="w-3 h-3 inline mr-1" />{kase.documentsCount} docs</span>
                  <span>Submitted {kase.submittedAt}</span>
                </div>
              </div>
            )
          })}

          <Separator className="bg-white/5 my-4" />
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Completed ({completed.length})</p>
          {completed.map(kase => {
            const { label, color, bg, icon: StatusIcon } = statusConfig[kase.status]
            return (
              <div key={kase.id} className="glass-panel rounded-xl p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{kase.clientName}</p>
                    <p className="text-xs text-slate-500">{kase.id} · Reviewed by {kase.reviewer}</p>
                  </div>
                  <Badge className={`${bg} ${color} text-xs flex items-center gap-1`}>
                    <StatusIcon className="w-2.5 h-2.5" />{label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {selected && (
          <Card className="bg-card border-white/10 sticky top-20 h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">{selected.clientName}</CardTitle>
                <Button variant="ghost" size="sm" className="text-slate-400 text-xs" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ['Case ID',    selected.id],
                  ['Type',       selected.clientType],
                  ['Submitted',  selected.submittedAt],
                  ['Documents',  `${selected.documentsCount} files`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/5 rounded-lg p-3">
                    <p className="text-slate-500">{k}</p>
                    <p className="text-white font-medium mt-0.5 capitalize">{v}</p>
                  </div>
                ))}
              </div>

              {selected.flagReason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs text-red-300 font-medium mb-1">Flag reason</p>
                  <p className="text-xs text-red-400">{selected.flagReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 gap-2">
                  <ThumbsUp className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0 gap-2">
                  <ThumbsDown className="w-3.5 h-3.5" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
