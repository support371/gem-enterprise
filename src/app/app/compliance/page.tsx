'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Upload,
  Download,
  Eye,
  Lock,
  DollarSign,
  Building2,
  Scale,
  Shield,
  Activity,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type ControlStatus = 'compliant' | 'review' | 'gap' | 'pending'

interface Control {
  id: string
  name: string
  domain: 'cyber' | 'financial' | 'realty' | 'legal' | 'governance'
  status: ControlStatus
  owner: string
  lastReview: string
  nextReview: string
  evidenceCount: number
  description: string
}

interface EvidenceItem {
  id: string
  ref: string
  class: 'governance' | 'interaction' | 'decision' | 'security' | 'financial' | 'legal' | 'quality'
  title: string
  controlId: string
  uploadedBy: string
  date: string
  retentionYears: number
}

// ── Mock data ────────────────────────────────────────────────────────────────

const controls: Control[] = [
  {
    id: 'C-001', name: 'Identity & Access Management', domain: 'governance',
    status: 'compliant', owner: 'Security Team',
    lastReview: '2026-02-15', nextReview: '2026-08-15', evidenceCount: 12,
    description: 'MFA enforcement, role-based access, least privilege, session management.',
  },
  {
    id: 'C-002', name: 'Data Encryption at Rest & Transit', domain: 'cyber',
    status: 'compliant', owner: 'Infrastructure',
    lastReview: '2026-01-20', nextReview: '2026-07-20', evidenceCount: 8,
    description: 'AES-256 at rest, TLS 1.3 in transit, key rotation policy.',
  },
  {
    id: 'C-003', name: 'KYC / Identity Verification', domain: 'financial',
    status: 'review', owner: 'Compliance Officer',
    lastReview: '2026-03-01', nextReview: '2026-06-01', evidenceCount: 5,
    description: 'Client identity proofing, document verification, ongoing monitoring.',
  },
  {
    id: 'C-004', name: 'AI Interaction Disclosure', domain: 'governance',
    status: 'compliant', owner: 'Legal & Compliance',
    lastReview: '2026-02-28', nextReview: '2026-08-28', evidenceCount: 3,
    description: 'Disclosure notices for AI-assisted interactions, escalation policy.',
  },
  {
    id: 'C-005', name: 'Incident Response Plan', domain: 'cyber',
    status: 'compliant', owner: 'Security Team',
    lastReview: '2026-01-10', nextReview: '2026-07-10', evidenceCount: 14,
    description: 'Documented IR playbooks, chain of custody, severity classification.',
  },
  {
    id: 'C-006', name: 'Property Transaction Records', domain: 'realty',
    status: 'review', owner: 'ATR Operations',
    lastReview: '2026-02-10', nextReview: '2026-05-10', evidenceCount: 7,
    description: 'Document provenance, consent logging, jurisdictional disclosure.',
  },
  {
    id: 'C-007', name: 'Payment Transaction Logging', domain: 'financial',
    status: 'compliant', owner: 'Finance',
    lastReview: '2026-03-05', nextReview: '2026-09-05', evidenceCount: 19,
    description: 'Invoice trail, refund records, dispute handling, settlement proof.',
  },
  {
    id: 'C-008', name: 'Legal Matter Intake Controls', domain: 'legal',
    status: 'gap', owner: 'Legal Services',
    lastReview: '2025-12-01', nextReview: '2026-04-01', evidenceCount: 2,
    description: 'Attorney review gates, conflict checks, privilege handling.',
  },
  {
    id: 'C-009', name: 'Data Retention & Deletion', domain: 'governance',
    status: 'pending', owner: 'DPO',
    lastReview: '2025-11-15', nextReview: '2026-04-15', evidenceCount: 1,
    description: 'Retention rules per domain, legal hold, deletion workflows.',
  },
  {
    id: 'C-010', name: 'Audit Log Integrity', domain: 'cyber',
    status: 'compliant', owner: 'Security Team',
    lastReview: '2026-03-01', nextReview: '2026-09-01', evidenceCount: 11,
    description: 'Immutable log store, access log completeness, anomaly alerting.',
  },
]

const evidenceItems: EvidenceItem[] = [
  { id: 'E-001', ref: 'C-001', class: 'security',    title: 'MFA Enrollment Report',              controlId: 'C-001', uploadedBy: 'J. Martinez', date: '2026-02-15', retentionYears: 7 },
  { id: 'E-002', ref: 'C-002', class: 'security',    title: 'Encryption Audit Certificate',       controlId: 'C-002', uploadedBy: 'K. Osei',     date: '2026-01-20', retentionYears: 7 },
  { id: 'E-003', ref: 'C-003', class: 'governance',  title: 'KYC Policy Document v3',             controlId: 'C-003', uploadedBy: 'A. Thompson', date: '2026-03-01', retentionYears: 10 },
  { id: 'E-004', ref: 'C-004', class: 'legal',       title: 'AI Disclosure Notice Draft',         controlId: 'C-004', uploadedBy: 'Legal Team',   date: '2026-02-28', retentionYears: 10 },
  { id: 'E-005', ref: 'C-005', class: 'decision',    title: 'IR Tabletop Exercise Results',       controlId: 'C-005', uploadedBy: 'C. Diallo',    date: '2026-01-10', retentionYears: 5 },
  { id: 'E-006', ref: 'C-007', class: 'financial',   title: 'Q1 Payment Reconciliation',          controlId: 'C-007', uploadedBy: 'Finance',      date: '2026-03-05', retentionYears: 10 },
  { id: 'E-007', ref: 'C-010', class: 'security',    title: 'SIEM Alert Summary — Feb 2026',      controlId: 'C-010', uploadedBy: 'SOC Analyst',  date: '2026-03-01', retentionYears: 5 },
  { id: 'E-008', ref: 'C-006', class: 'interaction', title: 'Client Consent Log — ATR Q1',        controlId: 'C-006', uploadedBy: 'ATR Ops',      date: '2026-02-10', retentionYears: 7 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<ControlStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  compliant: { label: 'Compliant',  color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/25',  icon: CheckCircle2 },
  review:    { label: 'In Review',  color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25', icon: Clock },
  gap:       { label: 'Gap',        color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25',       icon: AlertCircle },
  pending:   { label: 'Pending',    color: 'text-slate-400',  bg: 'bg-slate-500/15 border-slate-500/25',   icon: Clock },
}

const domainConfig: Record<Control['domain'], { label: string; icon: typeof Shield; colorText: string; colorBg: string; cardClass: string }> = {
  cyber:      { label: 'Cybersecurity', icon: Shield,    colorText: 'text-[hsl(var(--svc-cyber))]',      colorBg: 'bg-[hsl(var(--svc-cyber-muted))]',      cardClass: 'svc-cyber-card' },
  financial:  { label: 'Financial',     icon: DollarSign, colorText: 'text-[hsl(var(--svc-financial))]', colorBg: 'bg-[hsl(var(--svc-financial-muted))]',  cardClass: 'svc-financial-card' },
  realty:     { label: 'Real Estate',   icon: Building2,  colorText: 'text-[hsl(var(--svc-realty))]',    colorBg: 'bg-[hsl(var(--svc-realty-muted))]',     cardClass: 'svc-realty-card' },
  legal:      { label: 'Legal',         icon: Scale,      colorText: 'text-violet-400',                  colorBg: 'bg-violet-500/10',                      cardClass: '' },
  governance: { label: 'Governance',    icon: ShieldCheck, colorText: 'text-[hsl(var(--svc-cyber))]',    colorBg: 'bg-[hsl(var(--svc-cyber-muted))]',      cardClass: 'svc-cyber-card' },
}

const evidenceClassColors: Record<EvidenceItem['class'], string> = {
  governance:  'text-[hsl(var(--svc-cyber))] bg-[hsl(var(--svc-cyber-muted))]',
  interaction: 'text-[hsl(var(--svc-realty))] bg-[hsl(var(--svc-realty-muted))]',
  decision:    'text-[hsl(var(--svc-financial))] bg-[hsl(var(--svc-financial-muted))]',
  security:    'text-green-400 bg-green-500/10',
  financial:   'text-[hsl(var(--svc-financial))] bg-[hsl(var(--svc-financial-muted))]',
  legal:       'text-violet-400 bg-violet-500/10',
  quality:     'text-slate-400 bg-slate-500/10',
}

// ── Summary stats ─────────────────────────────────────────────────────────────

function SummaryBar() {
  const total     = controls.length
  const compliant = controls.filter(c => c.status === 'compliant').length
  const review    = controls.filter(c => c.status === 'review').length
  const gap       = controls.filter(c => c.status === 'gap').length
  const pending   = controls.filter(c => c.status === 'pending').length
  const score     = Math.round((compliant / total) * 100)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2 glass-panel rounded-xl p-5 svc-cyber-card bento-card">
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Compliance Score</p>
        <p className="text-4xl font-bold text-white">{score}<span className="text-xl text-slate-400">%</span></p>
        <div className="progress-track mt-3">
          <div className="progress-fill-cyber h-full rounded-full" style={{ width: `${score}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-2">{compliant}/{total} controls compliant</p>
      </div>
      {[
        { label: 'Compliant', value: compliant, color: 'text-green-400',  bg: 'bg-green-500/10' },
        { label: 'In Review', value: review,    color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Gap',       value: gap,       color: 'text-red-400',    bg: 'bg-red-500/10' },
        { label: 'Pending',   value: pending,   color: 'text-slate-400',  bg: 'bg-slate-500/10' },
      ].map(({ label, value, color, bg }) => (
        <div key={label} className={`glass-panel rounded-xl p-5 bento-card flex flex-col justify-between`}>
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          <div className={`w-8 h-1.5 rounded-full ${bg} mt-2`} />
        </div>
      ))}
    </div>
  )
}

// ── Control card ──────────────────────────────────────────────────────────────

function ControlCard({ control, onSelect, selected }: { control: Control; onSelect: (c: Control) => void; selected: boolean }) {
  const { label: statusLabel, color: statusColor, bg: statusBg, icon: StatusIcon } = statusConfig[control.status]
  const { label: domainLabel, icon: DomainIcon, colorText, colorBg, cardClass } = domainConfig[control.domain]

  return (
    <div
      className={`glass-panel rounded-xl p-4 bento-card cursor-pointer transition-all ${cardClass} ${selected ? 'ring-1 ring-white/20' : ''}`}
      onClick={() => onSelect(control)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${colorBg} flex items-center justify-center shrink-0`}>
            <DomainIcon className={`w-4 h-4 ${colorText}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-mono">{control.id}</p>
            <p className="text-sm font-semibold text-white leading-tight">{control.name}</p>
          </div>
        </div>
        <Badge className={`${statusBg} ${statusColor} text-xs flex items-center gap-1 shrink-0`}>
          <StatusIcon className="w-2.5 h-2.5" />
          {statusLabel}
        </Badge>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{control.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1"><User className="w-3 h-3" />{control.owner}</span>
        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{control.evidenceCount} items</span>
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due {control.nextReview}</span>
      </div>
    </div>
  )
}

// ── Evidence row ──────────────────────────────────────────────────────────────

function EvidenceRow({ item }: { item: EvidenceItem }) {
  const colorClass = evidenceClassColors[item.class]
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${colorClass}`}>{item.class}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{item.title}</p>
        <p className="text-xs text-slate-500">{item.ref} · Uploaded by {item.uploadedBy} · {item.date}</p>
      </div>
      <span className="text-xs text-slate-500 shrink-0">Retain {item.retentionYears}y</span>
      <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-white shrink-0">
        <Eye className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [domainFilter, setDomainFilter] = useState<string>('all')

  const domains = ['all', 'governance', 'cyber', 'financial', 'realty', 'legal']
  const filtered = domainFilter === 'all' ? controls : controls.filter(c => c.domain === domainFilter)

  const controlEvidence = selectedControl
    ? evidenceItems.filter(e => e.controlId === selectedControl.id)
    : []

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Evidence</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Control register, evidence store, and review status across all service domains.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-slate-300 hover:text-white gap-2">
            <Download className="w-4 h-4" /> Export Pack
          </Button>
          <Button size="sm" className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 gap-2">
            <Upload className="w-4 h-4" /> Upload Evidence
          </Button>
        </div>
      </div>

      {/* Summary */}
      <SummaryBar />

      <Tabs defaultValue="controls">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="controls" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            Control Register
          </TabsTrigger>
          <TabsTrigger value="evidence" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            Evidence Store
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
            Risk Register
          </TabsTrigger>
        </TabsList>

        {/* ── Controls tab ───────────────────────────────────── */}
        <TabsContent value="controls" className="mt-6">
          <div className="flex flex-wrap gap-2 mb-5">
            {domains.map(d => (
              <Button
                key={d}
                variant="outline"
                size="sm"
                onClick={() => setDomainFilter(d)}
                className={`border-white/10 text-xs capitalize ${domainFilter === d ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {d === 'all' ? 'All Domains' : domainConfig[d as Control['domain']]?.label ?? d}
              </Button>
            ))}
          </div>

          <div className={`grid gap-4 ${selectedControl ? 'lg:grid-cols-2' : 'lg:grid-cols-2 xl:grid-cols-3'}`}>
            {filtered.map(control => (
              <ControlCard
                key={control.id}
                control={control}
                onSelect={setSelectedControl}
                selected={selectedControl?.id === control.id}
              />
            ))}
          </div>

          {selectedControl && (
            <Card className="mt-6 bg-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
                    Evidence for {selectedControl.id}: {selectedControl.name}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-slate-400 text-xs" onClick={() => setSelectedControl(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {controlEvidence.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center">No evidence items attached to this control yet.</p>
                ) : (
                  controlEvidence.map(item => <EvidenceRow key={item.id} item={item} />)
                )}
                <Button variant="outline" size="sm" className="mt-4 border-white/10 text-slate-300 hover:text-white gap-2 w-full">
                  <Upload className="w-3.5 h-3.5" /> Attach Evidence
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Evidence store tab ──────────────────────────────── */}
        <TabsContent value="evidence" className="mt-6">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">All Evidence Items ({evidenceItems.length})</CardTitle>
                <Button size="sm" className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 gap-2 text-xs">
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {evidenceItems.map(item => <EvidenceRow key={item.id} item={item} />)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Risk register tab ────────────────────────────────── */}
        <TabsContent value="risk" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { id: 'R1', title: 'Deceptive AI presentation',        rating: 'High',   color: 'text-red-400',    bg: 'bg-red-500/10',    control: 'Mandate disclosure policy, visible AI notices, human escalation.' },
              { id: 'R2', title: 'Unauthorized regulated advice',    rating: 'High',   color: 'text-red-400',    bg: 'bg-red-500/10',    control: 'Hard policy boundaries, reviewer gates, restricted response classes.' },
              { id: 'R3', title: 'PII / confidential data leakage',  rating: 'High',   color: 'text-red-400',    bg: 'bg-red-500/10',    control: 'Data classification, tenancy separation, encryption, least privilege.' },
              { id: 'R4', title: 'Third-party outage disruption',    rating: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10', control: 'Fallback channels, retry queues, degraded-mode procedures.' },
              { id: 'R5', title: 'Poor traceability for compliance', rating: 'High',   color: 'text-red-400',    bg: 'bg-red-500/10',    control: 'Evidence store, immutable logs, record IDs, retention labels.' },
              { id: 'R6', title: 'Model hallucination / misrouting', rating: 'High',   color: 'text-red-400',    bg: 'bg-red-500/10',    control: 'Prompt controls, confidence thresholds, validation, exception review.' },
            ].map(risk => (
              <div key={risk.id} className="glass-panel rounded-xl p-5 bento-card">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-slate-500 font-mono">{risk.id}</p>
                  <Badge className={`${risk.bg} ${risk.color} text-xs border-0`}>{risk.rating}</Badge>
                </div>
                <p className="text-sm font-semibold text-white mb-2">{risk.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{risk.control}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  )
}
