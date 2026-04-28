"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  CheckCircle2,
  MapPin,
  Eye,
  AlertTriangle,
  Clock,
  FileText,
  Shield,
} from 'lucide-react'

const monitoredProperties = [
  {
    id: 'PROP-001',
    address: '1420 Harbor Blvd, Suite 800',
    city: 'Newport Beach, CA 92660',
    type: 'Commercial Office',
    value: ',200,000',
    status: 'Protected',
    lastCheck: 'Mar 15, 2026',
  },
  {
    id: 'PROP-002',
    address: '780 Canyon View Drive',
    city: 'Scottsdale, AZ 85251',
    type: 'Residential Estate',
    value: ',850,000',
    status: 'Protected',
    lastCheck: 'Mar 15, 2026',
  },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Clear: 'bg-green-500/20 text-green-400 border-green-500/30',
    Investigated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Resolved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Protected: 'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return <Badge className={map[status] ?? 'bg-slate-500/20 text-slate-400'}>{status}</Badge>
}

export default function RealEstateProductPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-yellow-400">Real Estate Protection</span>
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Title monitoring and property fraud protection.</p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
        </Badge>
      </div>

      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            PropertyShield Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            PropertyShield delivers continuous title monitoring, fraud detection, and ownership
            verification for all properties in your portfolio.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Monitored', value: '2', icon: Eye, color: 'text-yellow-400' },
              { label: 'Scans (30d)', value: '248', icon: FileText, color: 'text-cyan-400' },
              { label: 'Alerts', value: '1', icon: AlertTriangle, color: 'text-orange-400' },
              { label: 'Interval', value: '4h', icon: Clock, color: 'text-green-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-panel rounded-lg p-4 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-1.5`} />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {monitoredProperties.map((prop) => (
          <Card key={prop.id} className="bg-slate-900/50 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-mono text-cyan-400">{prop.id}</span>
                {statusBadge(prop.status)}
              </div>
              <p className="font-semibold text-white">{prop.address}</p>
              <p className="text-sm text-slate-400">{prop.city}</p>
              <Separator className="my-3 bg-white/10" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="text-sm text-white mt-0.5">{prop.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Value</p>
                  <p className="text-sm font-semibold text-cyan-400 mt-0.5">{prop.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
