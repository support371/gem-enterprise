'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Layers,
  FileText,
  ClipboardList,
  MessageSquare,
  Bell,
  Upload,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

type TaskStatus = 'pending' | 'in_progress' | 'completed'

interface Task {
  title: string
  category: string
  status: TaskStatus
  due: string
}

const tasks: Task[] = [
  { title: 'Upload Q1 financial statements', category: 'Documents', status: 'pending', due: 'Mar 25, 2026' },
  { title: 'Review and sign updated compliance attestation', category: 'Compliance', status: 'in_progress', due: 'Mar 22, 2026' },
  { title: 'KYC renewal — annual identity verification', category: 'KYC', status: 'pending', due: 'Apr 1, 2026' },
  { title: 'Confirm portfolio allocation preferences', category: 'Portfolio', status: 'completed', due: 'Mar 10, 2026' },
]

const statusConfig: Record<TaskStatus, { icon: typeof Clock; label: string; color: string; bg: string }> = {
  pending:     { icon: Clock,         label: 'Pending',     color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  in_progress: { icon: AlertCircle,   label: 'In Progress', color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  completed:   { icon: CheckCircle2,  label: 'Completed',   color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
}

const quickActions = [
  { icon: Upload,        label: 'Upload Document',    href: '/app/documents' },
  { icon: ClipboardList, label: 'New Request',         href: '/app/requests' },
  { icon: MessageSquare, label: 'Message Team',        href: '/app/messages' },
  { icon: Bell,          label: 'Notifications',       href: '/app/notifications' },
]

export default function WorkspacePage() {
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)
  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your action items, outstanding tasks, and quick-access tools.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(({ icon: Icon, label, href }) => (
          <Button
            key={label}
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-4 border-[hsl(var(--border))] text-slate-300 hover:text-white hover:border-[hsl(var(--svc-cyber))]/40"
          >
            <Link href={href}>
              <Icon className="w-5 h-5 text-[hsl(var(--svc-cyber))]" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',     value: pendingCount,   color: 'text-amber-400',   bg: 'bg-amber-400/10' },
          { label: 'In Progress', value: inProgressCount, color: 'text-blue-400',    bg: 'bg-blue-400/10' },
          { label: 'Completed',   value: tasks.filter((t) => t.status === 'completed').length, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Layers className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Action Items</h2>
          <div className="flex gap-1">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? 'default' : 'ghost'}
                onClick={() => setFilter(s)}
                className="h-7 text-xs capitalize"
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((task) => {
            const cfg = statusConfig[task.status]
            const Icon = cfg.icon
            return (
              <Card key={task.title} className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.category} · Due {task.due}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs border-current ${cfg.color} shrink-0`}
                  >
                    {cfg.label}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Documents shortcut */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
            <CardTitle className="text-sm text-white">Documents & Requests</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild size="sm" variant="outline" className="border-[hsl(var(--border))] text-slate-300 hover:text-white">
            <Link href="/app/documents">View Documents <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-[hsl(var(--border))] text-slate-300 hover:text-white">
            <Link href="/app/requests">View Requests <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
