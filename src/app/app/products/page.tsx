'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, DollarSign, Building2, ArrowRight, CheckCircle, Clock } from 'lucide-react'

// Product catalog — entries keyed by slug for entitlement matching.
// client_approved grants access to all products; individual slugs grant specific ones.
const PRODUCT_CATALOG = [
  {
    category: 'Cybersecurity',
    href: '/app/products/cyber',
    icon: Shield,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    items: [
      { name: 'CyberShield Pro',   slugs: ['client_approved', 'cyberShieldPro'],   description: 'Enterprise-grade threat detection and prevention platform with real-time monitoring and automated response.' },
      { name: 'Intelligence Feed', slugs: ['client_approved', 'intelligenceFeed'], description: 'Curated threat intelligence data streams providing actionable insights on emerging cyber threats and vulnerabilities.' },
    ],
  },
  {
    category: 'Financial',
    href: '/app/products/financial',
    icon: DollarSign,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    items: [
      { name: 'FinancialGuard', slugs: ['client_approved', 'financialGuard'], description: 'Comprehensive financial fraud detection and transaction monitoring system for enterprise-level protection.' },
    ],
  },
  {
    category: 'Real Estate',
    href: '/app/products/real-estate',
    icon: Building2,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    items: [
      { name: 'PropertyShield', slugs: ['client_approved', 'propertyShield'], description: 'Advanced title monitoring and real estate fraud protection covering your entire property portfolio.' },
    ],
  },
]

interface Entitlement { slug: string }

function ProductCard({
  name, slugs, description, categoryHref, entitlementSlugs,
}: {
  name: string
  slugs: string[]
  description: string
  categoryHref: string
  entitlementSlugs: Set<string>
}) {
  const active = slugs.some(s => entitlementSlugs.has(s))
  return (
    <div className="glass-panel rounded-xl p-4 bento-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {active
            ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            : <Clock className="w-4 h-4 text-slate-500 shrink-0" />}
          <p className="font-semibold text-white text-sm">{name}</p>
        </div>
        <Badge className={active
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }>
          {active ? 'Active' : 'Pending'}
        </Badge>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
      <Link href={categoryHref}>
        <Button size="sm" variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs">
          View Details <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </Link>
    </div>
  )
}

function CategorySection({
  category, href, icon: Icon, iconColor, iconBg, items, entitlementSlugs,
}: (typeof PRODUCT_CATALOG)[number] & { entitlementSlugs: Set<string> }) {
  return (
    <Card className="bg-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            {category}
          </CardTitle>
          <Link href={href}>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs gap-1">
              View Suite <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <ProductCard key={item.name} {...item} categoryHref={href} entitlementSlugs={entitlementSlugs} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProductsPage() {
  const [entitlementSlugs, setEntitlementSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/entitlements')
      .then(r => r.json())
      .then(d => setEntitlementSlugs(new Set((d.entitlements as Entitlement[]).map(e => e.slug))))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Your <span className="text-gradient-primary">Products</span>
        </h1>
        <p className="text-slate-400 mt-1">Manage and monitor all your active GEM Enterprise products.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all"        className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">All</TabsTrigger>
          <TabsTrigger value="cyber"      className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Cybersecurity</TabsTrigger>
          <TabsTrigger value="financial"  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Financial</TabsTrigger>
          <TabsTrigger value="real-estate" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Real Estate</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-6">
          {PRODUCT_CATALOG.map(p => <CategorySection key={p.category} {...p} entitlementSlugs={entitlementSlugs} />)}
        </TabsContent>
        <TabsContent value="cyber"       className="mt-6"><CategorySection {...PRODUCT_CATALOG[0]} entitlementSlugs={entitlementSlugs} /></TabsContent>
        <TabsContent value="financial"   className="mt-6"><CategorySection {...PRODUCT_CATALOG[1]} entitlementSlugs={entitlementSlugs} /></TabsContent>
        <TabsContent value="real-estate" className="mt-6"><CategorySection {...PRODUCT_CATALOG[2]} entitlementSlugs={entitlementSlugs} /></TabsContent>
      </Tabs>
    </div>
  )
}
