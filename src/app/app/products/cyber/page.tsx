import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Settings,
  Monitor,
  Download,
  Zap,
  Radio,
  Server,
} from 'lucide-react'

const threatEvents = [
  { date: 'Mar 15, 2026', type: 'Phishing Attempt', severity: 'High', status: 'Blocked' },
  { date: 'Mar 14, 2026', type: 'Malware Detection', severity: 'Critical', status: 'Quarantined' },
  { date: 'Mar 13, 2026', type: 'Brute Force Attack', severity: 'Medium', status: 'Blocked' },
  { date: 'Mar 12, 2026', type: 'SQL Injection', severity: 'High', status: 'Blocked' },
  { date: 'Mar 11, 2026', type: 'Port Scan', severity: 'Low', status: 'Logged' },
  { date: 'Mar 10, 2026', type: 'Ransomware Attempt', severity: 'Critical', status: 'Blocked' },
  { date: 'Mar 9, 2026', type: 'Data Exfiltration', severity: 'High', status: 'Blocked' },
]

function severityBadge(severity: string) {
  const map: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return <Badge className={map[severity] ?? 'bg-slate-500/20 text-slate-400'}>{severity}</Badge>
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Blocked: 'bg-green-500/20 text-green-400 border-green-500/30',
    Quarantined: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Logged: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  return <Badge className={map[status] ?? 'bg-slate-500/20 text-slate-400'}>{status}</Badge>
}

export default function CyberProductPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-gradient-primary">Cybersecurity</span> Suite
            </h1>
          </div>
          <p className="text-slate-400 mt-1 ml-13">Enterprise-grade cyber protection and threat intelligence.</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
        </Badge>
      </div>

      {/* Product cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            icon: Shield,
            name: 'CyberShield Pro',
            desc: 'AI-powered threat detection platform with automated incident response and 24/7 monitoring.',
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
          },
          {
            icon: Radio,
            name: 'Intelligence Feed',
            desc: 'Real-time threat intelligence streams covering 200+ global threat actor groups and TTPs.',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
          },
          {
            icon: Server,
            name: 'SOC Access',
            desc: '24/7 Security Operations Center access with dedicated analyst support and escalation paths.',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
        ].map(({ icon: Icon, name, desc, color, bg }) => (
          <div key={name} className="glass-panel rounded-xl p-5 bento-card">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-semibold text-white mb-1">{name}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Threats Blocked (30d)', value: '1,247', icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Alerts Resolved', value: '98.6%', icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Active Monitors', value: '34', icon: Eye, color: 'text-cyan-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel rounded-xl p-5 text-center bento-card">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: FileText, label: 'View Reports', href: '/app/documents' },
              { icon: Settings, label: 'Configure Alerts', href: '#' },
              { icon: Monitor, label: 'SOC Dashboard', href: '#' },
              { icon: Download, label: 'Download Report', href: '#' },
            ].map(({ icon: Icon, label, href }) => (
              <Link key={label} href={href}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex-col gap-2 py-4 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <Icon className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs">{label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threat events table */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-white">Recent Threat Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Threat Type</TableHead>
                <TableHead className="text-slate-400">Severity</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threatEvents.map((evt, i) => (
                <TableRow key={i} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-slate-300 text-sm">{evt.date}</TableCell>
                  <TableCell className="text-white text-sm font-medium">{evt.type}</TableCell>
                  <TableCell>{severityBadge(evt.severity)}</TableCell>
                  <TableCell>{statusBadge(evt.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
