'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Users, Search, Shield, CheckCircle, Clock, AlertCircle,
  ChevronLeft, UserPlus, DollarSign, Building2,
} from 'lucide-react'
import Link from 'next/link'

type UserRole   = 'client' | 'admin' | 'super_admin'
type UserStatus = 'active' | 'pending_kyc' | 'suspended'

interface UserRecord {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  kycType: string
  joinedAt: string
  lastActive: string
  portfolioValue: string
  serviceLines: string[]
}

const users: UserRecord[] = [
  { id: 'USR-001', name: 'Meridian Holdings',   email: 'ops@meridian.com',       role: 'client',      status: 'active',      kycType: 'Family Office', joinedAt: '2025-09-01', lastActive: '1h ago',    portfolioValue: '$5.2M',  serviceLines: ['cyber', 'financial', 'realty'] },
  { id: 'USR-002', name: 'Priya Sharma',         email: 'p.sharma@email.com',     role: 'client',      status: 'pending_kyc', kycType: 'Individual',    joinedAt: '2026-03-10', lastActive: '2d ago',    portfolioValue: '—',      serviceLines: ['cyber'] },
  { id: 'USR-003', name: 'Nexus Capital LLC',    email: 'admin@nexuscap.io',      role: 'client',      status: 'pending_kyc', kycType: 'Business',      joinedAt: '2026-03-12', lastActive: '3d ago',    portfolioValue: '—',      serviceLines: ['financial'] },
  { id: 'USR-004', name: 'Westfield Trust',      email: 'info@westfield.co',      role: 'client',      status: 'active',      kycType: 'Trust',         joinedAt: '2025-11-20', lastActive: '5h ago',    portfolioValue: '$1.8M',  serviceLines: ['realty', 'legal'] },
  { id: 'USR-005', name: 'Kwame Asante',         email: 'k.asante@email.com',     role: 'client',      status: 'suspended',   kycType: 'Individual',    joinedAt: '2026-02-28', lastActive: '7d ago',    portfolioValue: '—',      serviceLines: ['cyber'] },
  { id: 'USR-006', name: 'Sara Okonkwo',         email: 's.okonkwo@email.com',    role: 'client',      status: 'active',      kycType: 'Individual',    joinedAt: '2025-10-15', lastActive: '20min ago', portfolioValue: '$420K',  serviceLines: ['financial', 'realty'] },
  { id: 'USR-007', name: 'J. Martinez',          email: 'j.martinez@gem.io',      role: 'admin',       status: 'active',      kycType: 'Staff',         joinedAt: '2024-06-01', lastActive: '10min ago', portfolioValue: '—',      serviceLines: [] },
  { id: 'USR-008', name: 'Platform Admin',       email: 'admin@gem-enterprise.io', role: 'super_admin', status: 'active',     kycType: 'Staff',         joinedAt: '2024-01-01', lastActive: 'Now',        portfolioValue: '—',      serviceLines: [] },
]

const statusConfig: Record<UserStatus, { label: string; color: string; bg: string }> = {
  active:      { label: 'Active',      color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/25' },
  pending_kyc: { label: 'Pending KYC', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25' },
  suspended:   { label: 'Suspended',   color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25' },
}

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  client:      { label: 'Client',      color: 'text-slate-300' },
  admin:       { label: 'Admin',       color: 'text-[hsl(var(--svc-cyber))]' },
  super_admin: { label: 'Super Admin', color: 'text-[hsl(var(--svc-financial))]' },
}

const svcIconMap: Record<string, typeof Shield> = {
  cyber:     Shield,
  financial: DollarSign,
  realty:    Building2,
  legal:     Shield,
}

const svcColorMap: Record<string, string> = {
  cyber:     'text-[hsl(var(--svc-cyber))]',
  financial: 'text-[hsl(var(--svc-financial))]',
  realty:    'text-[hsl(var(--svc-realty))]',
  legal:     'text-violet-400',
}

export default function UsersPage() {
  const [query, setQuery] = useState('')
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/app/admin">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage client accounts, roles, and access permissions.</p>
        </div>
        <Button size="sm" className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-4">
        {[
          { label: 'Active',      value: users.filter(u => u.status === 'active').length,      color: 'text-green-400' },
          { label: 'Pending KYC', value: users.filter(u => u.status === 'pending_kyc').length, color: 'text-yellow-400' },
          { label: 'Suspended',   value: users.filter(u => u.status === 'suspended').length,   color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 text-center bento-card">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[hsl(var(--svc-cyber))]"
        />
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['User', 'Role', 'Status', 'KYC Type', 'Portfolio', 'Services', 'Last Active'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const { label: statusLabel, color: statusColor, bg: statusBg } = statusConfig[u.status]
                const { label: roleLabel, color: roleColor } = roleConfig[u.role]
                return (
                  <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${roleColor}`}>{roleLabel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusBg} ${statusColor} text-xs`}>{statusLabel}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{u.kycType}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-300">{u.portfolioValue}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {u.serviceLines.map(svc => {
                          const Icon = svcIconMap[svc] ?? Shield
                          return <Icon key={svc} className={`w-3.5 h-3.5 ${svcColorMap[svc]}`} />
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{u.lastActive}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
