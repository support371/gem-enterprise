'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, AlertCircle, CheckCircle, Shield, ChevronLeft, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface KycApplication {
  id: string
  status: string
  createdAt: string
  reviewNotes: string | null
  user: {
    email: string
    profile: { firstName: string | null; lastName: string | null } | null
  }
}

const pendingStatuses = new Set(['in_progress', 'under_review', 'manual_review', 'documents_uploaded'])

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
}

export default function ApprovalsPage() {
  const [applications, setApplications] = useState<KycApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<Record<string, 'approve' | 'reject' | null>>({})

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/kyc')
      if (!res.ok) return
      const data = await res.json()
      setApplications(
        (data.applications as KycApplication[]).filter(a => pendingStatuses.has(a.status))
      )
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActioning(prev => ({ ...prev, [id]: action }))
    try {
      await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, action }),
      })
      await fetchApplications()
    } finally {
      setActioning(prev => ({ ...prev, [id]: null }))
    }
  }

  const urgent = applications.filter(a => daysSince(a.createdAt) >= 3 || a.status === 'manual_review')

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
            Human review gate — KYC applications requiring admin decision.
          </p>
        </div>
      </div>

      {!loading && urgent.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              {urgent.length} application{urgent.length > 1 ? 's' : ''} require immediate review
            </p>
            <p className="text-xs text-red-400 mt-0.5">Applications pending ≥3 days or flagged for manual review.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending',  value: applications.length,                                                 color: 'text-white' },
          { label: 'Manual Review',  value: applications.filter(a => a.status === 'manual_review').length,       color: 'text-red-400' },
          { label: 'Under Review',   value: applications.filter(a => a.status === 'under_review').length,        color: 'text-yellow-400' },
          { label: 'In Progress',    value: applications.filter(a => a.status === 'in_progress').length,         color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 bento-card text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-xl">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-white font-semibold">All caught up</p>
          <p className="text-slate-400 text-sm mt-1">No pending KYC approvals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const days = daysSince(app.createdAt)
            const isUrgent = days >= 3 || app.status === 'manual_review'
            const name = [app.user.profile?.firstName, app.user.profile?.lastName]
              .filter(Boolean).join(' ') || app.user.email
            const acting = actioning[app.id]
            return (
              <div key={app.id} className="glass-panel rounded-xl p-5 bento-card svc-cyber-card">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--svc-cyber-muted))] flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-[hsl(var(--svc-cyber))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <p className="text-xs text-slate-500 font-mono">{app.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm font-semibold text-white">KYC Review — {name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={isUrgent
                          ? 'bg-red-500/15 border-red-500/25 text-red-400 text-xs'
                          : 'bg-yellow-500/15 border-yellow-500/25 text-yellow-400 text-xs'
                        }>
                          {isUrgent ? 'Urgent' : 'Normal'}
                        </Badge>
                        <Badge className="bg-white/5 text-slate-300 border-white/10 text-xs capitalize">
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      {app.reviewNotes || `Identity verification application from ${app.user.email}.`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {days === 0 ? 'Today' : `${days}d ago`} · {app.user.email}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={!!acting}
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 gap-1.5 text-xs"
                          onClick={() => handleAction(app.id, 'approve')}
                        >
                          {acting === 'approve'
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <ThumbsUp className="w-3 h-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          disabled={!!acting}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0 gap-1.5 text-xs"
                          onClick={() => handleAction(app.id, 'reject')}
                        >
                          {acting === 'reject'
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <ThumbsDown className="w-3 h-3" />}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
