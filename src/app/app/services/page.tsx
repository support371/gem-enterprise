'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  TrendingUp,
  Building2,
  ArrowRight,
  CheckCircle2,
  Lock,
  BarChart3,
} from 'lucide-react'

const services = [
  {
    icon: Shield,
    label: 'Cybersecurity',
    badge: 'Active',
    badgeVariant: 'default' as const,
    desc: 'Advanced threat intelligence, SOC monitoring, vulnerability management, and incident response.',
    features: ['24/7 SOC Coverage', 'Threat intelligence feeds', 'Incident response retainer'],
    href: '/app/products/cyber',
    color: 'text-[hsl(var(--svc-cyber))]',
    bg: 'bg-[hsl(var(--svc-cyber-muted))]',
  },
  {
    icon: TrendingUp,
    label: 'Financial Security',
    badge: 'Active',
    badgeVariant: 'default' as const,
    desc: 'Asset recovery, fraud mitigation, regulatory compliance, and portfolio-level financial risk monitoring.',
    features: ['Forensic accounting', 'Fraud mitigation', 'Regulatory compliance'],
    href: '/app/products/financial',
    color: 'text-[hsl(var(--svc-financial))]',
    bg: 'bg-[hsl(var(--svc-financial-muted))]',
  },
  {
    icon: Building2,
    label: 'Real Estate',
    badge: 'Available',
    badgeVariant: 'secondary' as const,
    desc: 'Strategic real estate investment advisory, property acquisition support, and portfolio analysis.',
    features: ['Investment advisory', 'Property analysis', 'Portfolio strategy'],
    href: '/atr',
    color: 'text-[hsl(var(--svc-realty))]',
    bg: 'bg-[hsl(var(--svc-realty-muted))]',
  },
]

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Your Services</h1>
        <p className="text-slate-400 text-sm mt-1">
          Active entitlements and available service expansions for your account.
        </p>
      </div>

      {/* Service cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map(({ icon: Icon, label, badge, badgeVariant, desc, features, href, color, bg }) => (
          <Card key={label} className="bg-[hsl(var(--card))] border-[hsl(var(--border))] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <Badge variant={badgeVariant} className="text-xs">{badge}</Badge>
              </div>
              <CardTitle className="text-base text-white">{label}</CardTitle>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <ul className="space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild size="sm" variant="outline" className="w-full border-[hsl(var(--border))] text-slate-300 hover:text-white">
                <Link href={href}>
                  View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance note */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardContent className="flex items-start gap-3 pt-5">
          <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-300">Access controlled by entitlement</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Service access is governed by your approved entitlements. Contact your account manager or{' '}
              <Link href="/app/support" className="text-[hsl(var(--svc-cyber))] hover:underline">open a support request</Link>{' '}
              to discuss additional services.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Shield, label: 'Active Services', value: '2', color: 'text-[hsl(var(--svc-cyber))]', bg: 'bg-[hsl(var(--svc-cyber-muted))]' },
          { icon: BarChart3, label: 'Reports Available', value: '8', color: 'text-[hsl(var(--svc-financial))]', bg: 'bg-[hsl(var(--svc-financial-muted))]' },
          { icon: CheckCircle2, label: 'Compliance Score', value: '98%', color: 'text-[hsl(var(--svc-realty))]', bg: 'bg-[hsl(var(--svc-realty-muted))]' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
            <CardContent className="flex items-center gap-3 pt-5">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
