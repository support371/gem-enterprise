'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  Loader2,
  Fingerprint,
  ShieldCheck,
  Building2,
  Landmark,
  Users,
  Activity,
  FileCheck2,
  UserCheck,
} from 'lucide-react'
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

const entityIcons: Record<string, typeof User> = {
  individual: User,
  business: Building2,
  trust: Landmark,
  family_office: Users,
  'family-office': Users,
}

function clientName(app: KycApplication) {
  const p = app.user.profile
  if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ')
  return app.user.email
}

function entityLabel(entityType: string) {
  return entityType.replace(/_/g, ' ').replace(/-/g, ' ')
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
  const pendingReview = applications.filter(a => a.status === 'under_review' || a.status === 'documents_uploaded')
  const inProgress = applications.filter(a => a.status === 'in_progress')
  const flagged = applications.filter(a => a.status === 'manual_review')
  const approved = applications.filter(a => a.status === 'approved')

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/app/admin">
            <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 text-slate-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <Fingerprint className="h-3.5 w-3.5" />
              Verification Review Console
            </div>
            <h1 className="text-2xl font-bold text-white">KYC Queue</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Review identity, entity, document, and manual-escalation submissions before entitlement activation.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-green-500/25 bg-green-500/15 text-green-400">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Evidence Ready
          </Badge>
          <Badge className="border-cyan-500/25 bg-cyan-500/10 text-cyan-400">
            <Activity className="mr-1 h-3.5 w-3.5" /> Live Queue
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Pending Review', value: pendingReview.length, color: 'text-blue-400', icon: FileCheck2, bg: 'bg-blue-500/10' },
          { label: 'In Progress', value: inProgress.length, color: 'text-yellow-400', icon: Clock, bg: 'bg-yellow-500/10' },
          { label: 'Manual Review', value: flagged.length, color: 'text-red-400', icon: AlertCircle, bg: 'bg-red-500/10' },
          { label: 'Approved', value: approved.length, color: 'text-green-400', icon: UserCheck, bg: 'bg-green-500/10' },
        ].map(({ label, value, color, icon: Icon, bg }) => (
          <div key={label} className="glass-panel bento-card rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading applications…
        </div>
      ) : (
        <div className={`grid gap-6 ${selected ? 'xl:grid-cols-[1.1fr_0.9fr]' : ''}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Action Required ({actionable.length})</p>
              <Button variant="ghost" size="sm" onClick={fetchApplications} className="h-8 text-xs text-slate-400 hover:text-white">
                Refresh
              </Button>
            </div>

            {actionable.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-500">
                No applications require action.
              </div>
            )}

            {actionable.map(app => {
              const cfg = statusConfig[app.status] ?? statusConfig.under_review
              const { label, color, bg, icon: StatusIcon } = cfg
              const EntityIcon = entityIcons[app.entityType] ?? User
              return (
                <div
                  key={app.id}
                  className={`glass-panel bento-card cursor-pointer rounded-xl p-4 svc-financial-card ${selected?.id === app.id ? 'ring-1 ring-cyan-400/40' : ''}`}
                  onClick={() => setSelected(app)}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                        <EntityIcon className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{clientName(app)}</p>
                        <p className="text-xs capitalize text-slate-400">{entityLabel(app.entityType)}</p>
                      </div>
                    </div>
                    <Badge className={`${bg} ${color} flex items-center gap-1 text-xs`}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {label}
                    </Badge>
                  </div>

                  {app.reviewNotes && (
                    <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5">
                      <p className="text-xs text-red-300"><AlertCircle className="mr-1 inline h-3 w-3" />{app.reviewNotes}</p>
                    </div>
                  )}

                  <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <span className="font-mono">{app.id.slice(0, 12)}…</span>
                    <span><FileText className="mr-1 inline h-3 w-3" />{app.documents.length} docs</span>
                    <span>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Not submitted'}</span>
                  </div>
                </div>
              )
            })}

            <Separator className="my-4 bg-white/5" />

            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Completed ({completed.length})</p>
            {completed.map(app => {
              const cfg = statusConfig[app.status] ?? statusConfig.approved
              const { label, color, bg, icon: StatusIcon } = cfg
              return (
                <div key={app.id} className="glass-panel rounded-xl p-4 opacity-70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{clientName(app)}</p>
                      <p className="text-xs text-slate-500">{app.id.slice(0, 12)} · {app.user.email}</p>
                    </div>
                    <Badge className={`${bg} ${color} flex items-center gap-1 text-xs`}>
                      <StatusIcon className="h-2.5 w-2.5" />{label}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          {selected && (
            <Card className="sticky top-20 h-fit border-white/10 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">Review Dossier</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setSelected(null)}>Close</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-lg font-bold text-white">{clientName(selected)}</p>
                  <p className="mt-1 text-sm text-slate-400">{selected.user.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['Entity Type', entityLabel(selected.entityType)],
                    ['Application ID', selected.id.slice(0, 12)],
                    ['Submitted', selected.submittedAt ? new Date(selected.submittedAt).toLocaleDateString() : 'Not yet'],
                    ['Documents', `${selected.documents.length} files`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-white/5 p-3">
                      <p className="text-slate-500">{k}</p>
                      <p className="mt-0.5 font-medium capitalize text-white">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <p className="text-sm font-semibold text-cyan-400">Compliance checklist</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li>Identity/entity profile reviewed</li>
                    <li>Supporting documents counted</li>
                    <li>Decision state will be captured through existing admin API</li>
                  </ul>
                </div>

                {selected.reviewNotes && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="mb-1 text-xs font-medium text-red-300">Review notes</p>
                    <p className="text-xs text-red-400">{selected.reviewNotes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleAction(selected.id, 'approve')}
                    className="gap-2 border-0 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />} Approve
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleAction(selected.id, 'reject')}
                    className="gap-2 border-0 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ThumbsDown className="h-3.5 w-3.5" />} Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleAction(selected.id, 'manual_review')}
                    className="col-span-2 gap-2 border-0 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> Flag for Manual Review
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
