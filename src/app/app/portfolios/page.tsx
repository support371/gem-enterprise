'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

interface Portfolio {
  id: string
  name: string
  description: string | null
  category: string
  totalValue: string | null
  currency: string
  role: string
  assignedAt: string
}

const categoryColor: Record<string, string> = {
  Cybersecurity:  'text-cyan-400',
  Financial:      'text-purple-400',
  'Real Estate':  'text-yellow-400',
  Compliance:     'text-green-400',
}

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/portfolios')
      .then(r => r.json())
      .then(d => setPortfolios(d.portfolios ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Your <span className="text-gradient-primary">Portfolios</span>
        </h1>
        <p className="text-slate-400 mt-1">View and manage your GEM Enterprise portfolio positions.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Failed to load portfolios. Please try again later.</p>
        </div>
      )}

      {!loading && !error && portfolios.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-xl">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold">No portfolios assigned</p>
          <p className="text-slate-400 text-sm mt-1">
            Contact your advisor or submit a service request to get portfolio access.
          </p>
        </div>
      )}

      {!loading && !error && portfolios.length > 0 && (
        <div className="space-y-4">
          {portfolios.map(p => {
            const colorClass = categoryColor[p.category] ?? 'text-slate-300'
            return (
              <Card key={p.id} className="bg-card border-white/10 glow-cyan">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{p.name}</CardTitle>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{p.id.slice(0, 12).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                      <Badge className="bg-white/5 text-slate-300 border-white/10 capitalize">{p.role}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div className="glass-panel rounded-lg p-3">
                      <p className="text-xs text-slate-400">Category</p>
                      <p className={`text-base font-bold mt-1 ${colorClass}`}>{p.category}</p>
                    </div>
                    <div className="glass-panel rounded-lg p-3">
                      <p className="text-xs text-slate-400">Total Value</p>
                      <p className="text-base font-bold mt-1 text-white">
                        {p.totalValue
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency }).format(Number(p.totalValue))
                          : '—'}
                      </p>
                    </div>
                    <div className="glass-panel rounded-lg p-3">
                      <p className="text-xs text-slate-400">Assigned</p>
                      <p className="text-base font-bold mt-1 text-white">
                        {new Date(p.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-sm text-slate-400">{p.description}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
