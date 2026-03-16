import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Package,
  FileText,
  ClipboardList,
  Bell,
  Briefcase,
  Upload,
  Send,
  PhoneCall,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

const stats = [
  { label: 'Active Products', value: '4', icon: Package, color: 'text-cyan-400' },
  { label: 'Documents', value: '8', icon: FileText, color: 'text-purple-400' },
  { label: 'Open Requests', value: '2', icon: ClipboardList, color: 'text-yellow-400' },
  { label: 'Notifications', value: '3', icon: Bell, color: 'text-red-400' },
]

const activityFeed = [
  {
    id: 1,
    icon: CheckCircle2,
    color: 'text-green-400',
    title: 'KYC Approved',
    desc: 'Your identity verification was successfully approved.',
    time: '2 days ago',
  },
  {
    id: 2,
    icon: FileText,
    color: 'text-cyan-400',
    title: 'Document Viewed',
    desc: 'Q1 Portfolio Statement was accessed.',
    time: '3 days ago',
  },
  {
    id: 3,
    icon: Package,
    color: 'text-purple-400',
    title: 'Product Activated',
    desc: 'CyberShield Pro has been activated on your account.',
    time: '5 days ago',
  },
  {
    id: 4,
    icon: AlertCircle,
    color: 'text-yellow-400',
    title: 'Support Ticket Opened',
    desc: 'Ticket #GEM-2048 submitted regarding portfolio access.',
    time: '1 week ago',
  },
  {
    id: 5,
    icon: TrendingUp,
    color: 'text-cyan-400',
    title: 'Allocation Updated',
    desc: 'Your portfolio allocation was rebalanced per your advisor.',
    time: '2 weeks ago',
  },
]

const quickActions = [
  { label: 'Upload Document', icon: Upload, href: '/app/documents' },
  { label: 'Submit Request', icon: Send, href: '/app/requests' },
  { label: 'Contact Advisor', icon: PhoneCall, href: '/app/support' },
  { label: 'View Products', icon: Eye, href: '/app/products' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good morning,{' '}
          <span className="text-gradient-primary">Valued Client</span>
        </h1>
        <p className="text-slate-400 mt-1">Here's an overview of your GEM Enterprise account.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-panel rounded-xl p-5 bento-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-400">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Portfolio overview */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                  Portfolio Overview
                </CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass-panel rounded-lg p-4">
                <p className="text-sm text-slate-400">Portfolio Name</p>
                <p className="text-lg font-semibold text-white mt-1">GEM Cyber-Financial Portfolio</p>
                <Separator className="my-3 bg-white/10" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Total Value</p>
                    <p className="text-xl font-bold text-cyan-400 mt-0.5">$2,500,000</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="text-sm font-medium text-white mt-0.5">March 15, 2026</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Cybersecurity', pct: '45%', color: 'bg-cyan-500' },
                  { label: 'Financial', pct: '35%', color: 'bg-purple-500' },
                  { label: 'Real Estate', pct: '20%', color: 'bg-yellow-500' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="glass-panel rounded-lg p-3 text-center">
                    <div className={`w-8 h-8 rounded-full ${color}/20 flex items-center justify-center mx-auto mb-2`}>
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                    </div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-white">{pct}</p>
                  </div>
                ))}
              </div>
              <Link href="/app/portfolios">
                <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                  View Full Portfolio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map(({ label, icon: Icon, href }) => (
                <Link key={label} href={href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Compliance status */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <p className="text-sm font-semibold text-white">Compliance Status</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              All requirements met
            </Badge>
            <p className="text-xs text-slate-400 mt-2">
              All compliance requirements are satisfied. No action needed.
            </p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {activityFeed.map(({ id, icon: Icon, color, title, desc, time }, idx) => (
              <div key={id}>
                <div className="flex items-start gap-3 py-3">
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{time}</span>
                </div>
                {idx < activityFeed.length - 1 && <Separator className="bg-white/5" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
