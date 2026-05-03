"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Landmark,
  Shield,
  Lock,
  PiggyBank,
  Clock,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Percent,
  Zap,
  Plus
} from 'lucide-react'

const vaults = [
  { name: 'Primary Reserve', type: 'Savings', balance: '45,000', apy: '4.5%', earned: ',240', status: 'Active', color: 'cyan' },
  { name: 'Q3 Tax Lock', type: 'Locked', balance: '20,000', apy: '5.2%', earned: '90', status: 'Locked', maturityDate: 'Sep 30, 2026', progress: 65, color: 'purple' },
  { name: 'Estate Escrow', type: 'Escrow', balance: '50,000', apy: '3.8%', earned: ',100', status: 'Pending', color: 'yellow' },
]

const vaultStats = [
  { label: 'Total Saved', value: '$115,000', change: '+2.1%', icon: PiggyBank, color: 'cyan' },
  { label: 'Average APY', value: '4.5%', change: '+0.2%', icon: Percent, color: 'purple' },
  { label: 'Interest Earned', value: '$1,450', change: '+MTD', icon: ArrowUpRight, color: 'green' },
  { label: 'Active Vaults', value: '3', change: 'running', icon: Landmark, color: 'yellow' },
]

const recentActivity = [
  { date: 'Apr 24, 2026', type: 'Interest', description: 'Monthly yield payment - Primary Reserve', amount: '+42.50' },
  { date: 'Apr 20, 2026', type: 'Deposit', description: 'Transfer from external account', amount: '+0,000.00' },
  { date: 'Apr 15, 2026', type: 'Interest', description: 'Yield payment - Q3 Tax Lock', amount: '+20.12' },
  { date: 'Apr 10, 2026', type: 'Transfer', description: 'Internal transfer to Estate Escrow', amount: '-0,000.00' },
]

export default function SavingsVaultPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Savings <span className="text-cyan-400">Vault</span>
          </h1>
          <p className="text-slate-400 mt-1">Secure institutional-grade savings and escrow management.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
            <Zap className="w-4 h-4 mr-2" />
            Quick Transfer
          </Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            New Vault
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vaultStats.map((stat) => (
          <Card key={stat.label} className={`bg-card border-white/10 ${stat.color === 'cyan' ? 'glow-cyan' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1 text-slate-400">
                    <ArrowUpRight className="w-3 h-3 text-green-400" />
                    <span className="text-xs">{stat.change}</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'cyan' ? 'bg-cyan-500/10' :
                  stat.color === 'green' ? 'bg-green-500/10' :
                  stat.color === 'purple' ? 'bg-purple-500/10' :
                  'bg-yellow-500/10'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'cyan' ? 'text-cyan-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'purple' ? 'text-purple-400' :
                    'text-yellow-400'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vault Accounts */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-white">Vault Accounts</CardTitle>
                <CardDescription className="text-slate-400">Manage your savings vaults and deposits</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              4 Vaults Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {vaults.map((vault) => (
            <div 
              key={vault.name} 
              className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    vault.status === 'Locked' ? 'bg-yellow-500/10' : 'bg-cyan-500/10'
                  }`}>
                    {vault.status === 'Locked' ? (
                      <Lock className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <PiggyBank className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{vault.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                        {vault.type}
                      </Badge>
                      <span className="text-xs text-slate-500">•</span>
                      {'maturityDate' in vault && <span className="text-xs text-slate-400">{vault.maturityDate}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-slate-400">Balance</p>
                    <p className="text-lg font-bold text-white">{vault.balance}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-slate-400">APY</p>
                    <p className="text-lg font-bold text-green-400">{vault.apy}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs text-slate-400">Interest/mo</p>
                    <p className="text-lg font-bold text-cyan-400">${vault.earned}</p>
                  </div>
                  <Badge className={`${
                    vault.status === 'Active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {vault.status}
                  </Badge>
                </div>
              </div>

              {/* Goal progress for locked vaults */}
              {'progress' in vault && vault.progress != null && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Progress</span>
                    <span className="text-sm font-medium text-white">
                      {vault.progress}% complete
                    </span>
                  </div>
                  <Progress value={vault.progress} className="h-2 bg-white/10" />
                  <p className="text-xs text-slate-500 mt-1">
                    {'maturityDate' in vault ? `Matures ${vault.maturityDate}` : ''}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Banner */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Enterprise-Grade Security</p>
            <p className="text-xs text-slate-400 mt-0.5">
              All vaults are protected by multi-signature authorization, insurance coverage up to 0M, and 24/7 monitoring.
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">Protected</Badge>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Description</TableHead>
                  <TableHead className="text-slate-400 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity, idx) => (
                  <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-slate-400 text-sm">{activity.date}</TableCell>
                    <TableCell>
                      <Badge className={`${
                        activity.type === 'Interest' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        activity.type === 'Deposit' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                        activity.type === 'Transfer' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">{activity.description}</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      activity.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activity.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
