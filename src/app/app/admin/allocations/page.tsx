'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PieChart, TrendingUp, Shield, DollarSign, Building2, Scale, ChevronLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const aumByService = [
  {
    label: 'Cybersecurity',
    icon:  Shield,
    aum:   '$140.4M',
    pct:   45,
    clients:  62,
    ytd:   '+11.2%',
    colorText: 'text-[hsl(var(--svc-cyber))]',
    colorBg:   'bg-[hsl(var(--svc-cyber-muted))]',
    fillClass: 'progress-fill-cyber',
    cardClass: 'svc-cyber-card',
  },
  {
    label: 'Financial Security',
    icon:  DollarSign,
    aum:   '$109.2M',
    pct:   35,
    clients:  48,
    ytd:   '+8.4%',
    colorText: 'text-[hsl(var(--svc-financial))]',
    colorBg:   'bg-[hsl(var(--svc-financial-muted))]',
    fillClass: 'progress-fill-financial',
    cardClass: 'svc-financial-card',
  },
  {
    label: 'Real Estate',
    icon:  Building2,
    aum:   '$62.4M',
    pct:   20,
    clients:  18,
    ytd:   '+14.7%',
    colorText: 'text-[hsl(var(--svc-realty))]',
    colorBg:   'bg-[hsl(var(--svc-realty-muted))]',
    fillClass: 'progress-fill-realty',
    cardClass: 'svc-realty-card',
  },
]

const topClients = [
  { name: 'Meridian Holdings',  aum: '$5.2M',  services: 3, ytd: '+9.1%' },
  { name: 'Westfield Trust',    aum: '$1.8M',  services: 2, ytd: '+12.3%' },
  { name: 'Sara Okonkwo',       aum: '$420K',  services: 2, ytd: '+7.8%' },
  { name: 'Nexus Capital LLC',  aum: 'Pending', services: 1, ytd: '—' },
]

export default function AllocationsPage() {
  const totalAum = '$312M'
  const totalClients = 128

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/app/admin">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Allocations</h1>
          <p className="text-slate-400 text-sm mt-0.5">Platform AUM distribution and service allocation oversight.</p>
        </div>
      </div>

      {/* Platform totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Platform AUM',    value: totalAum,      color: 'text-[hsl(var(--svc-cyber))]', icon: PieChart },
          { label: 'Managed Clients',        value: String(totalClients), color: 'text-white',          icon: TrendingUp },
          { label: 'YTD Platform Return',    value: '+10.8%',      color: 'text-green-400',             icon: ArrowUpRight },
          { label: 'Avg Portfolio Size',     value: '$2.4M',       color: 'text-[hsl(var(--svc-realty))]', icon: DollarSign },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-panel rounded-xl p-5 bento-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Service breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {aumByService.map(({ label, icon: Icon, aum, pct, clients, ytd, colorText, colorBg, fillClass, cardClass }) => (
          <div key={label} className={`glass-panel rounded-xl p-5 bento-card ${cardClass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-lg ${colorBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colorText}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className={`text-xs ${colorText} font-mono`}>{aum}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Platform share</span>
                  <span className={`font-semibold ${colorText}`}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Clients</p>
                  <p className="text-lg font-bold text-white">{clients}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-slate-400">YTD Return</p>
                  <p className="text-lg font-bold text-green-400">{ytd}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top clients */}
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
            Top Clients by AUM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Client', 'AUM', 'Services', 'YTD'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topClients.map((c, i) => (
                <tr key={c.name} className={`border-b border-white/5 hover:bg-white/5 transition-colors`}>
                  <td className="py-3 px-3 text-white font-medium">{c.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-300 text-xs">{c.aum}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {Array.from({ length: c.services }).map((_, j) => (
                        <div key={j} className={`w-1.5 h-1.5 rounded-full ${j === 0 ? 'bg-[hsl(var(--svc-cyber))]' : j === 1 ? 'bg-[hsl(var(--svc-financial))]' : 'bg-[hsl(var(--svc-realty))]'}`} />
                      ))}
                    </div>
                  </td>
                  <td className={`py-3 px-3 text-xs font-mono ${c.ytd.startsWith('+') ? 'text-green-400' : 'text-slate-400'}`}>{c.ytd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <p className="text-xs text-yellow-400 font-semibold mb-1">Human review gate active</p>
        <p className="text-xs text-yellow-300">Allocation changes above 5% require compliance officer approval before execution. Pending: 1 rebalance request (APR-0087).</p>
      </div>
    </div>
  )
}
