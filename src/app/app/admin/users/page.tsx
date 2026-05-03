'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users, Search, Shield, ChevronLeft, UserPlus, DollarSign, Building2, Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface UserRecord {
  id: string
  email: string
  role: string
  status: string
  isActive: boolean
  createdAt: string
  profile: {
    firstName: string | null
    lastName: string | null
    entityType: string | null
  } | null
}

const statusColor: Record<string, string> = {
  active:           'bg-green-500/15 text-green-400 border-green-500/25',
  suspended:        'bg-red-500/15 text-red-400 border-red-500/25',
  pending_approval: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
}

const roleColor: Record<string, string> = {
  client:      'text-slate-300',
  analyst:     'text-blue-400',
  admin:       'text-[hsl(var(--svc-cyber))]',
  super_admin: 'text-[hsl(var(--svc-financial))]',
  internal:    'text-violet-400',
}

function displayName(u: UserRecord) {
  if (u.profile?.firstName || u.profile?.lastName) {
    return [u.profile.firstName, u.profile.lastName].filter(Boolean).join(' ')
  }
  return u.email
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleRoleChange(id: string, role: string) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    await fetchUsers()
  }

  async function handleStatusToggle(u: UserRecord) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
    })
    await fetchUsers()
  }

  const filtered = users.filter(u =>
    displayName(u).toLowerCase().includes(query.toLowerCase()) ||
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',    value: users.filter(u => u.isActive).length,  color: 'text-green-400' },
          { label: 'Suspended', value: users.filter(u => !u.isActive).length, color: 'text-red-400' },
          { label: 'Total',     value: users.length,                          color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel rounded-xl p-4 text-center bento-card">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{loading ? '—' : value}</p>
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
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['User', 'Role', 'Status', 'Entity Type', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{displayName(u)}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-semibold bg-transparent border-none outline-none cursor-pointer ${roleColor[u.role] ?? 'text-slate-300'}`}
                      >
                        {['client', 'analyst', 'admin'].map(r => (
                          <option key={r} value={r} className="bg-slate-900">{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusColor[u.status] ?? 'bg-slate-500/20 text-slate-400'} text-xs`}>
                        {u.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 capitalize">
                      {u.profile?.entityType?.replace('_', ' ') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(u)}
                        className={`text-xs ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
