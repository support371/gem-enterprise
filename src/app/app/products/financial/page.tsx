import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Eye,
  Clock,
} from 'lucide-react'

const flaggedTransactions = [
  {
    id: 'TXN-9821',
    date: 'Mar 14, 2026',
    amount: '$48,500',
    type: 'Wire Transfer',
    flag: 'Unusual Amount',
    severity: 'Medium',
    resolved: true,
  },
  {
    id: 'TXN-9784',
    date: 'Mar 12, 2026',
    amount: '$2,100',
    type: 'International Transfer',
    flag: 'High-Risk Country',
    severity: 'High',
    resolved: false,
  },
  {
    id: 'TXN-9740',
    date: 'Mar 10, 2026',
    amount: '$15,000',
    type: 'ACH Transfer',
    flag: 'Frequency Anomaly',
    severity: 'Low',
    resolved: true,
  },
  {
    id: 'TXN-9701',
    date: 'Mar 7, 2026',
    amount: '$97,200',
    type: 'Wire Transfer',
    flag: 'Structuring Pattern',
    severity: 'High',
    resolved: true,
  },
]

function severityBadge(severity: string) {
  const map: Record<string, string> = {
    High: 'bg-red-500/20 text-red-400 border-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return <Badge className={map[severity] ?? 'bg-slate-500/20 text-slate-400'}>{severity}</Badge>
}

export default function FinancialProductPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-gradient-primary">Financial Security</span> Suite
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Comprehensive financial fraud detection and monitoring.</p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
        </Badge>
      </div>

      {/* FinancialGuard overview */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            FinancialGuard Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="glass-panel rounded-lg p-5">
            <p className="text-sm text-slate-400 mb-3">
              FinancialGuard provides enterprise-level financial fraud detection utilizing AI-driven
              transaction analysis, pattern recognition, and real-time monitoring across all connected
              financial accounts and instruments.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Monitored Accounts', value: '12', icon: Eye, color: 'text-purple-400' },
                { label: 'Transactions Analyzed', value: '4,892', icon: TrendingUp, color: 'text-cyan-400' },
                { label: 'Flags Raised (30d)', value: '4', icon: AlertTriangle, color: 'text-yellow-400' },
                { label: 'Avg. Response Time', value: '< 2m', icon: Clock, color: 'text-green-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction monitoring summary */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Transaction Monitoring Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Total Transactions (30d)', value: '4,892', status: 'normal' },
            { label: 'Clean Transactions', value: '4,888', status: 'good' },
            { label: 'Flagged for Review', value: '4', status: 'warn' },
            { label: 'Blocked Transactions', value: '0', status: 'normal' },
          ].map(({ label, value, status }) => (
            <div key={label} className="flex items-center justify-between py-2">
              <p className="text-sm text-slate-300">{label}</p>
              <span
                className={`font-semibold text-sm ${
                  status === 'good' ? 'text-green-400' :
                  status === 'warn' ? 'text-yellow-400' : 'text-white'
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance status */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'AML Compliance', badge: 'Compliant', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
              { label: 'KYC Status', badge: 'Verified', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
              { label: 'SAR Filings', badge: '0 Pending', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            ].map(({ label, badge, color }) => (
              <div key={label} className="glass-panel rounded-lg p-4 text-center">
                <p className="text-sm text-slate-400 mb-2">{label}</p>
                <Badge className={color}>{badge}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flagged transaction notices */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white">Recent Flagged Transaction Notices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flaggedTransactions.map((txn, idx) => (
              <div key={txn.id}>
                <div className="flex items-center justify-between py-2 flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-cyan-400">{txn.id}</span>
                      <span className="text-xs text-slate-500">{txn.date}</span>
                    </div>
                    <p className="text-sm text-white">{txn.type} — {txn.amount}</p>
                    <p className="text-xs text-slate-400">Flag: {txn.flag}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {severityBadge(txn.severity)}
                    <Badge
                      className={
                        txn.resolved
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }
                    >
                      {txn.resolved ? 'Resolved' : 'Under Review'}
                    </Badge>
                  </div>
                </div>
                {idx < flaggedTransactions.length - 1 && <Separator className="bg-white/5" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
