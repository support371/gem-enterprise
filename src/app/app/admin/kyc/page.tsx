'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, AlertCircle, User, FileText, Eye, ThumbsUp, ThumbsDown, ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type KycStatus = 'not_started' | 'started' | 'in_progress' | 'documents_uploaded' | 'under_review' | 'manual_review' | 'approved' | 'rejected' | 'expired'

interface KycApplication {
  id: string
  status: KycStatus
  entityType: string
  submittedAt: string | null
  reviewNotes: string | null
  createdAt: string
  user: {
    id: string
    email: string
    profile: { firstName: string | null; lastName: string | null } | null
  }
  documents: { id: string }[]
  decision: { decision: string; decisionBy: string } | null
}

const actionableStatuses = new Set(['in_progress', 'documents_uploaded', 'under_review', 'manual_review'])
const completedStatuses = new Set(['approved', 'rejected', 'expired'])

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  not_started:       { label: 'Not Started',  color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/25',  icon: Clock },
  started:           { label: 'Started',       color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/25',  icon: Clock },
  in_progress:       { label: 'In Progress',   color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25', icon: Clock },
  documents_uploaded:{ label: 'Docs Uploaded', color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/25',    icon: FileText },
  under_review:      { label: 'Under Review',  color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25', icon: Eye },
  manual_review:     { label: 'Flagged',       color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25',       icon: AlertCircle },
  approved:          { label: 'Approved',      color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/25',   icon: CheckCircle },
  rejected:          { label: 'Rejected',      color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25',       icon: AlertCircle },
  expired:           { label: 'Expired',       color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/25',  icon: Clock },
}

function clientName(app: KycApplication) {
  const p = app.user.profile
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ')
  return app.user.email
}

export default function KycQueuePage() {
  const [applications, setApplications] = useState<KycApplication[]>([])
  const [selected, setSelected] = useState<KycApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/kyc')
      const data = await res.json()
      if (data.applications) setApplications(data.applications)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  async function handleAction(applicationId: string, action: 'approve' | 'reject' | 'manual_review') {
    setActionLoading(true)
    try {
      await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action }),
      })
      setSelected(null)
      await fetchApplications()
    } finally {
      setActionLoading(false)
    }
  }

  const actionable = applications.filter(a => actionableStatuses.has(a.status))
  const completed  = applications.filter(a => completedStatuses.has(a.status))

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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: applications.filter(a => a.status === 'under_review' || a.status === 'documents_uploaded').length, color: 'text-slate-300' },
          { label: 'In Progress',    value: applications.filter(a => a.status === 'in_progress').length, color: 'text-yellow-400' },
          { label: 'Flagged',        value: applications.filter(a => a.status === 'manual_review').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 text-center bento-card">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading applications…
        </div>
      ) : (
        <div className={`grid gap-6 ${selected ? 'lg:grid-cols-2' : ''}`}>
          <div className="space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Action Required ({actionable.length})</p>
            {actionable.length === 0 && (
              <p className="text-sm text-slate-500 py-4">No applications require action.</p>
            )}
            {actionable.map(app => {
              const cfg = statusConfig[app.status] ?? statusConfig.under_review
              const { label, color, bg, icon: StatusIcon } = cfg
              return (
                <div
                  key={app.id}
                  className={`glass-panel rounded-xl p-4 bento-card cursor-pointer svc-financial-card ${selected?.id === app.id ? 'ring-1 ring-white/20' : ''}`}
                  onClick={() => setSelected(app)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{clientName(app)}</p>
                        <p className="text-xs text-slate-400 capitalize">{app.entityType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge className={`${bg} ${color} text-xs flex items-center gap-1`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {label}
                    </Badge>
                  </div>
                  {app.reviewNotes && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 mb-3">
                      <p className="text-xs text-red-300"><AlertCircle className="w-3 h-3 inline mr-1" />{app.reviewNotes}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono">{app.id.slice(0, 12)}…</span>
                    <span><FileText className="w-3 h-3 inline mr-1" />{app.documents.length} docs</span>
                    <span>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Not submitted'}</span>
                  </div>
                </div>
              )
            })}

            <Separator className="bg-white/5 my-4" />
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Completed ({completed.length})</p>
            {completed.map(app => {
              const cfg = statusConfig[app.status] ?? statusConfig.approved
              const { label, color, bg, icon: StatusIcon } = cfg
              return (
                <div key={app.id} className="glass-panel rounded-xl p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{clientName(app)}</p>
                      <p className="text-xs text-slate-500">{app.id.slice(0, 12)} · {app.user.email}</p>
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
                  <CardTitle className="text-white text-sm">{clientName(selected)}</CardTitle>
                  <Button variant="ghost" size="sm" className="text-slate-400 text-xs" onClick={() => setSelected(null)}>Close</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['Email',     selected.user.email],
                    ['Type',      selected.entityType.replace('_', ' ')],
                    ['Submitted', selected.submittedAt ? new Date(selected.submittedAt).toLocaleDateString() : 'Not yet'],
                    ['Documents', `${selected.documents.length} files`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white/5 rounded-lg p-3">
                      <p className="text-slate-500">{k}</p>
                      <p className="text-white font-medium mt-0.5 capitalize">{v}</p>
                    </div>
                  ))}
                </div>

                {selected.reviewNotes && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs text-red-300 font-medium mb-1">Review notes</p>
                    <p className="text-xs text-red-400">{selected.reviewNotes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleAction(selected.id, 'approve')}
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />} Approve
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleAction(selected.id, 'reject')}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0 gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsDown className="w-3.5 h-3.5" />} Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleAction(selected.id, 'manual_review')}
                    className="col-span-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0 gap-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Flag for Manual Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
