'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users, Search, Shield, DollarSign, Building2, Scale,
  CheckCircle2, Clock, AlertCircle, Eye, Bot, UserCheck,
  MessageSquare, Phone, Video, ChevronRight, Lock, Info,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type PersonaType   = 'human_staff' | 'ai_assisted' | 'supervised_va' | 'hybrid_queue'
type ProfileDomain = 'cyber' | 'financial' | 'realty' | 'legal' | 'platform'
type ProfileStatus = 'active' | 'review' | 'suspended'

interface ApprovedChannel {
  type: 'chat' | 'email' | 'phone' | 'video'
  withConsent: boolean
  transcriptLogged: boolean
}

interface Profile {
  id: string
  displayName: string
  title: string
  personaType: PersonaType
  domain: ProfileDomain
  status: ProfileStatus
  approvedResponseClasses: string[]
  approvedChannels: ApprovedChannel[]
  escalationPath: string
  disclosureTreatment: string
  owner: string
  nextReview: string
  serviceScope: string[]
  avatar: string
}

// ── Governed profile registry ─────────────────────────────────────────────────
// Every profile has a declared persona type, approved scope, disclosure treatment,
// and escalation path — per Master Dossier §7 (Profile Framework).

const profiles: Profile[] = [
  {
    id: 'PRF-001',
    displayName: 'GEM Security Operations',
    title: 'Cybersecurity Support',
    personaType: 'ai_assisted',
    domain: 'cyber',
    status: 'active',
    approvedResponseClasses: ['FAQ', 'INTAKE', 'SUMMARIZATION', 'ROUTING'],
    approvedChannels: [
      { type: 'chat',  withConsent: true,  transcriptLogged: true },
      { type: 'email', withConsent: true,  transcriptLogged: true },
    ],
    escalationPath: 'SOC Lead → Security Team Lead',
    disclosureTreatment: 'AI-assisted. Disclosure shown before first message. Human escalation on SECURITY_CLOSURE.',
    owner: 'J. Martinez',
    nextReview: '2026-08-01',
    serviceScope: ['Incident intake', 'FAQ', 'Ticket routing', 'Status updates'],
    avatar: 'G',
  },
  {
    id: 'PRF-002',
    displayName: 'Financial Advisory Desk',
    title: 'Financial Security Advisor',
    personaType: 'human_staff',
    domain: 'financial',
    status: 'active',
    approvedResponseClasses: ['FAQ', 'INTAKE', 'ADVISORY', 'PORTFOLIO_REVIEW'],
    approvedChannels: [
      { type: 'chat',  withConsent: true,  transcriptLogged: true },
      { type: 'email', withConsent: true,  transcriptLogged: true },
      { type: 'phone', withConsent: true,  transcriptLogged: true },
    ],
    escalationPath: 'Finance Officer → Compliance Officer',
    disclosureTreatment: 'Verified human staff. Identity disclosed on request.',
    owner: 'K. Osei',
    nextReview: '2026-09-01',
    serviceScope: ['Portfolio review', 'KYC guidance', 'Billing inquiries', 'Financial intake'],
    avatar: 'K',
  },
  {
    id: 'PRF-003',
    displayName: 'ATR Property Advisor',
    title: 'Real Estate Advisor — Alliance Trust Realty',
    personaType: 'human_staff',
    domain: 'realty',
    status: 'active',
    approvedResponseClasses: ['FAQ', 'INTAKE', 'PROPERTY_ADVISORY', 'SCHEDULING'],
    approvedChannels: [
      { type: 'chat',  withConsent: true,  transcriptLogged: true },
      { type: 'email', withConsent: true,  transcriptLogged: true },
      { type: 'video', withConsent: true,  transcriptLogged: true },
    ],
    escalationPath: 'ATR Operations → Compliance Officer',
    disclosureTreatment: 'Verified human advisor. Video sessions are recorded and disclosed.',
    owner: 'ATR Ops',
    nextReview: '2026-07-01',
    serviceScope: ['Property inquiries', 'Title security', 'Transaction support', 'Scheduling'],
    avatar: 'A',
  },
  {
    id: 'PRF-004',
    displayName: 'Legal Intake Queue',
    title: 'Legal Services Intake',
    personaType: 'hybrid_queue',
    domain: 'legal',
    status: 'review',
    approvedResponseClasses: ['FAQ', 'INTAKE', 'ROUTING'],
    approvedChannels: [
      { type: 'chat',  withConsent: true,  transcriptLogged: true },
      { type: 'email', withConsent: true,  transcriptLogged: true },
    ],
    escalationPath: 'Legal Intake → Attorney Review → External Counsel',
    disclosureTreatment: 'AI-assisted intake only. No legal advice provided by this profile. Attorney review required before engagement.',
    owner: 'Legal Services',
    nextReview: '2026-04-01',
    serviceScope: ['Matter intake', 'Document collection', 'Routing to attorney'],
    avatar: 'L',
  },
  {
    id: 'PRF-005',
    displayName: 'Platform Support Assistant',
    title: 'General Platform Support',
    personaType: 'ai_assisted',
    domain: 'platform',
    status: 'active',
    approvedResponseClasses: ['FAQ', 'ROUTING', 'SUMMARIZATION'],
    approvedChannels: [
      { type: 'chat',  withConsent: true,  transcriptLogged: true },
    ],
    escalationPath: 'Engineering Support → Admin',
    disclosureTreatment: 'AI-assisted. Cannot handle regulated matters. Disclosure shown on session start.',
    owner: 'Platform Team',
    nextReview: '2026-09-01',
    serviceScope: ['Navigation help', 'Account questions', 'Document requests', 'Routing'],
    avatar: 'P',
  },
]

// ── Config ────────────────────────────────────────────────────────────────────

const personaConfig: Record<PersonaType, { label: string; icon: typeof UserCheck; color: string; bg: string; note: string }> = {
  human_staff:    { label: 'Verified Human',    icon: UserCheck, color: 'text-green-400',  bg: 'bg-green-500/10',                          note: 'Identity verified. Interacting with a real person.' },
  ai_assisted:    { label: 'AI-Assisted',       icon: Bot,       color: 'text-[hsl(var(--svc-cyber))]',  bg: 'bg-[hsl(var(--svc-cyber-muted))]', note: 'Powered by AI. Disclosure provided before first message.' },
  supervised_va:  { label: 'Supervised VA',     icon: Bot,       color: 'text-yellow-400', bg: 'bg-yellow-500/10',                         note: 'AI response under human supervision.' },
  hybrid_queue:   { label: 'Hybrid Queue',      icon: Users,     color: 'text-slate-300',  bg: 'bg-white/10',                              note: 'AI intake, human review before response.' },
}

const domainConfig: Record<ProfileDomain, { icon: typeof Shield; colorText: string; colorBg: string; cardClass: string; label: string }> = {
  cyber:     { icon: Shield,       colorText: 'text-[hsl(var(--svc-cyber))]',     colorBg: 'bg-[hsl(var(--svc-cyber-muted))]',     cardClass: 'svc-cyber-card',     label: 'Cybersecurity' },
  financial: { icon: DollarSign,   colorText: 'text-[hsl(var(--svc-financial))]', colorBg: 'bg-[hsl(var(--svc-financial-muted))]', cardClass: 'svc-financial-card', label: 'Financial' },
  realty:    { icon: Building2,    colorText: 'text-[hsl(var(--svc-realty))]',    colorBg: 'bg-[hsl(var(--svc-realty-muted))]',    cardClass: 'svc-realty-card',    label: 'Real Estate' },
  legal:     { icon: Scale,        colorText: 'text-violet-400',                  colorBg: 'bg-violet-500/10',                     cardClass: '',                   label: 'Legal' },
  platform:  { icon: Shield,       colorText: 'text-slate-400',                   colorBg: 'bg-white/10',                          cardClass: '',                   label: 'Platform' },
}

const statusConfig: Record<ProfileStatus, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  active:    { color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/25',  icon: CheckCircle2 },
  review:    { color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25', icon: Clock },
  suspended: { color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25',       icon: AlertCircle },
}

const channelIcons: Record<ApprovedChannel['type'], typeof MessageSquare> = {
  chat:  MessageSquare,
  email: MessageSquare,
  phone: Phone,
  video: Video,
}

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({ profile, onSelect, selected }: { profile: Profile; onSelect: (p: Profile) => void; selected: boolean }) {
  const { label: personaLabel, icon: PersonaIcon, color: personaColor, bg: personaBg } = personaConfig[profile.personaType]
  const { icon: DomainIcon, colorText, colorBg, cardClass } = domainConfig[profile.domain]
  const { color: statusColor, bg: statusBg, icon: StatusIcon } = statusConfig[profile.status]

  return (
    <div
      className={`glass-panel rounded-xl p-5 bento-card cursor-pointer ${cardClass} ${selected ? 'ring-1 ring-white/20' : ''}`}
      onClick={() => onSelect(profile)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colorBg} flex items-center justify-center text-sm font-bold ${colorText}`}>
            {profile.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{profile.displayName}</p>
            <p className="text-xs text-slate-400">{profile.title}</p>
          </div>
        </div>
        <Badge className={`${statusBg} ${statusColor} text-xs flex items-center gap-1 shrink-0`}>
          <StatusIcon className="w-2.5 h-2.5" />
          {profile.status === 'active' ? 'Active' : profile.status === 'review' ? 'In Review' : 'Suspended'}
        </Badge>
      </div>

      {/* Persona type — governs disclosure treatment */}
      <div className={`flex items-center gap-2 rounded-lg p-2.5 mb-3 ${personaBg}`}>
        <PersonaIcon className={`w-4 h-4 ${personaColor} shrink-0`} />
        <div>
          <p className={`text-xs font-semibold ${personaColor}`}>{personaLabel}</p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{personaConfig[profile.personaType].note}</p>
        </div>
      </div>

      {/* Approved channels */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Channels</p>
        {profile.approvedChannels.map(ch => {
          const Icon = channelIcons[ch.type]
          return (
            <div key={ch.type} className="flex items-center gap-0.5" title={`${ch.type} — ${ch.transcriptLogged ? 'logged' : 'not logged'}`}>
              <Icon className={`w-3.5 h-3.5 ${colorText}`} />
              {ch.transcriptLogged && <Lock className="w-2.5 h-2.5 text-slate-500" />}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Review: {profile.nextReview}</span>
        <span className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3" /> Details
        </span>
      </div>
    </div>
  )
}

// ── Profile Detail ────────────────────────────────────────────────────────────

function ProfileDetail({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const { label: personaLabel, icon: PersonaIcon, color: personaColor, bg: personaBg } = personaConfig[profile.personaType]
  const { icon: DomainIcon, colorText, colorBg } = domainConfig[profile.domain]
  const { color: statusColor, bg: statusBg, icon: StatusIcon } = statusConfig[profile.status]

  return (
    <Card className="bg-card border-white/10 sticky top-20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 font-mono">{profile.id}</p>
            <CardTitle className="text-white text-sm mt-0.5">{profile.displayName}</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">{profile.title}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 text-xs shrink-0" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">

        {/* Persona + disclosure */}
        <div className={`rounded-xl p-3 ${personaBg} border border-white/5`}>
          <div className="flex items-center gap-2 mb-2">
            <PersonaIcon className={`w-4 h-4 ${personaColor}`} />
            <p className={`font-semibold ${personaColor}`}>{personaLabel}</p>
          </div>
          <p className="text-slate-300 leading-relaxed">{profile.disclosureTreatment}</p>
        </div>

        {/* Governance fields */}
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Domain',      domainConfig[profile.domain].label],
            ['Owner',       profile.owner],
            ['Next Review', profile.nextReview],
            ['Status',      profile.status],
          ].map(([k, v]) => (
            <div key={k} className="bg-white/5 rounded-lg p-2.5">
              <p className="text-slate-500">{k}</p>
              <p className="text-white font-medium capitalize mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Service scope */}
        <div>
          <p className="text-slate-500 uppercase tracking-widest font-semibold mb-2">Approved Service Scope</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.serviceScope.map(s => (
              <span key={s} className={`text-[10px] px-2 py-1 rounded-full ${colorBg} ${colorText}`}>{s}</span>
            ))}
          </div>
        </div>

        {/* Response classes */}
        <div>
          <p className="text-slate-500 uppercase tracking-widest font-semibold mb-2">Approved Response Classes</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.approvedResponseClasses.map(rc => (
              <span key={rc} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-slate-300 font-mono">{rc}</span>
            ))}
          </div>
          {profile.personaType.includes('ai') || profile.personaType === 'hybrid_queue' || profile.personaType === 'supervised_va' ? (
            <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              LEGAL_ADVICE, FINANCIAL_ADVICE, SECURITY_CLOSURE, IDENTITY_DETERMINATION — always escalated
            </p>
          ) : null}
        </div>

        {/* Channels */}
        <div>
          <p className="text-slate-500 uppercase tracking-widest font-semibold mb-2">Approved Channels</p>
          <div className="space-y-1.5">
            {profile.approvedChannels.map(ch => {
              const Icon = channelIcons[ch.type]
              return (
                <div key={ch.type} className="flex items-center justify-between bg-white/5 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${colorText}`} />
                    <span className="text-white capitalize">{ch.type}</span>
                    {ch.withConsent && <Badge className="bg-white/5 text-slate-400 border-white/10 text-[9px]">consent required</Badge>}
                  </div>
                  <span className={`text-[10px] ${ch.transcriptLogged ? 'text-green-400' : 'text-slate-500'}`}>
                    {ch.transcriptLogged ? '✓ transcript logged' : 'not logged'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Escalation */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-yellow-400 font-semibold mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Escalation Path
          </p>
          <p className="text-yellow-300">{profile.escalationPath}</p>
        </div>

      </CardContent>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilesPage() {
  const [selected, setSelected] = useState<Profile | null>(null)
  const [query, setQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('all')

  const filtered = profiles.filter(p => {
    const matchQuery  = !query || p.displayName.toLowerCase().includes(query.toLowerCase()) || p.title.toLowerCase().includes(query.toLowerCase())
    const matchDomain = domainFilter === 'all' || p.domain === domainFilter
    return matchQuery && matchDomain
  })

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[hsl(var(--svc-cyber))]" />
            Provider Profiles
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Governed service personas — each with declared scope, disclosure treatment, and escalation path.
          </p>
        </div>
        <Badge className="bg-[hsl(var(--svc-cyber-muted))] text-[hsl(var(--svc-cyber))] border-0 text-xs gap-1.5 px-3 py-1">
          <Info className="w-3 h-3" />
          ADR-003 governed
        </Badge>
      </div>

      {/* Disclosure notice */}
      <div className="bg-[hsl(var(--svc-cyber-muted))] border border-[hsl(var(--svc-cyber))]/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[hsl(var(--svc-cyber))] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white">Profile disclosure policy</p>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Every profile on this platform operates within an approved service scope. AI-assisted profiles display a disclosure notice before any interaction begins.
            No profile may represent itself as a human when it is not. Escalation to a verified human is mandatory when regulated thresholds are met.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active',      value: profiles.filter(p => p.status === 'active').length,    color: 'text-green-400' },
          { label: 'In Review',   value: profiles.filter(p => p.status === 'review').length,    color: 'text-yellow-400' },
          { label: 'Human Staff', value: profiles.filter(p => p.personaType === 'human_staff').length, color: 'text-white' },
          { label: 'AI-Assisted', value: profiles.filter(p => p.personaType !== 'human_staff').length,  color: 'text-[hsl(var(--svc-cyber))]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 text-center bento-card">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search profiles…"
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm"
          />
        </div>
        {['all', 'cyber', 'financial', 'realty', 'legal', 'platform'].map(d => (
          <Button
            key={d}
            variant="outline"
            size="sm"
            onClick={() => setDomainFilter(d)}
            className={`border-white/10 text-xs capitalize ${domainFilter === d ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {d === 'all' ? 'All' : domainConfig[d as ProfileDomain]?.label ?? d}
          </Button>
        ))}
      </div>

      {/* Grid + detail */}
      <div className={`grid gap-5 ${selected ? 'lg:grid-cols-2' : 'lg:grid-cols-2 xl:grid-cols-3'}`}>
        {filtered.map(p => (
          <ProfileCard
            key={p.id}
            profile={p}
            onSelect={setSelected}
            selected={selected?.id === p.id}
          />
        ))}
      </div>

      {selected && (
        <div className="lg:hidden">
          <ProfileDetail profile={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {selected && (
        <div className="hidden lg:block fixed right-6 top-20 w-80 z-40">
          <ProfileDetail profile={selected} onClose={() => setSelected(null)} />
        </div>
      )}

    </div>
  )
}
