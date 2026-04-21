import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Vault, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign,
  ShieldCheck,
  Lock,
  Plus,
  Clock,
  Percent,
  Target,
  Zap,
} from 'lucide-react'

const vaultStats = [
  { 
    label: 'Total Vault Balance', 
    value: '$1,245,750', 
    change: '+$12,500 this month',
    icon: DollarSign,
    color: 'cyan',
  },
  { 
    label: 'Current APY', 
    value: '5.25%', 
    change: 'Compounding daily',
    icon: Percent,
    color: 'green',
  },
  { 
    label: 'Interest Earned YTD', 
    value: '$48,240', 
    change: '+$3,200 this month',
    icon: TrendingUp,
    color: 'purple',
  },
  { 
    label: 'Security Level', 
    value: 'Maximum', 
    change: 'Multi-sig protected',
    icon: ShieldCheck,
    color: 'yellow',
  },
]

const vaultAccounts = [
  { 
    name: 'Primary Savings Vault', 
    type: 'High-Yield', 
    balance: '$750,000',
    apy: '5.25%',
    interest: '$3,281.25/mo',
    status: 'Active',
    lockPeriod: 'Flexible',
  },
  { 
    name: 'Fixed Term Vault', 
    type: 'Term Deposit', 
    balance: '$300,000',
    apy: '6.50%',
    interest: '$1,625.00/mo',
    status: 'Locked',
    lockPeriod: '12 months',
  },
  { 
    name: 'Emergency Reserve', 
    type: 'Instant Access', 
    balance: '$125,750',
    apy: '4.00%',
    interest: '$419.17/mo',
    status: 'Active',
    lockPeriod: 'None',
  },
  { 
    name: 'Goal-Based Vault', 
    type: 'Target Savings', 
    balance: '$70,000',
    apy: '5.00%',
    interest: '$291.67/mo',
    status: 'Active',
    lockPeriod: 'Flexible',
    goal: '$100,000',
    progress: 70,
  },
]

const recentActivity = [
  { date: 'Apr 20, 2026', type: 'Interest', description: 'Monthly interest credited', amount: '+$5,325.09' },
  { date: 'Apr 18, 2026', type: 'Deposit', description: 'Auto-deposit from linked account', amount: '+$10,000.00' },
  { date: 'Apr 15, 2026', type: 'Transfer', description: 'To Primary Savings Vault', amount: '+$25,000.00' },
  { date: 'Apr 10, 2026', type: 'Withdrawal', description: 'To external account', amount: '-$5,000.00' },
]

export default function SavingsVaultPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Savings <span className="text-gradient-primary">Vault</span>
          </h1>
          <p className="text-slate-400 mt-1">Secure, high-yield savings with institutional-grade protection.</p>
        </div>
        <div className="flex gap-2">
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
                <Vault className="w-5 h-5 text-cyan-400" />
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
          {vaultAccounts.map((vault) => (
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
                    ) : vault.type === 'Target Savings' ? (
                      <Target className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <Vault className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{vault.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                        {vault.type}
                      </Badge>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{vault.lockPeriod}</span>
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
                    <p className="text-lg font-bold text-cyan-400">{vault.interest}</p>
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

              {/* Goal progress for target savings */}
              {vault.goal && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Goal Progress</span>
                    <span className="text-sm font-medium text-white">
                      {vault.balance} / {vault.goal}
                    </span>
                  </div>
                  <Progress value={vault.progress} className="h-2 bg-white/10" />
                  <p className="text-xs text-slate-500 mt-1">
                    {vault.progress}% towards goal • ${(100000 - 70000).toLocaleString()} remaining
                  </p>
                </div>
              )}
            </div>
          ))}
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
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-card border-white/10 border-l-4 border-l-cyan-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Institutional-Grade Security</h3>
              <p className="text-sm text-slate-400 mt-1">
                Your savings are protected by multi-signature authorization, cold storage protocols, 
                and FDIC-equivalent insurance coverage up to $10 million per depositor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
