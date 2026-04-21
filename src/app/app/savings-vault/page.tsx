import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  PiggyBank,
  TrendingUp,
  Shield,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  Percent,
  Landmark,
  ChevronRight,
} from 'lucide-react'

const vaultSummary = [
  { label: 'Total Savings', value: '$485,250.00', icon: PiggyBank },
  { label: 'Earned Interest', value: '$12,450.00', change: '+2.6%', isPositive: true, icon: TrendingUp },
  { label: 'Active Vaults', value: '3', icon: Lock },
  { label: 'Avg. APY', value: '5.8%', icon: Percent },
]

const vaults = [
  {
    name: 'High-Yield Reserve',
    type: 'Flexible',
    balance: '$250,000.00',
    apy: '4.5%',
    earned: '$5,625.00',
    lockPeriod: 'No lock',
    status: 'Active',
    progress: 100,
    color: 'cyan',
  },
  {
    name: 'Fixed Term Vault',
    type: 'Locked',
    balance: '$150,000.00',
    apy: '7.2%',
    earned: '$5,400.00',
    lockPeriod: '12 months',
    maturityDate: 'Dec 15, 2026',
    status: 'Locked',
    progress: 65,
    color: 'purple',
  },
  {
    name: 'Security Deposit',
    type: 'Escrow',
    balance: '$85,250.00',
    apy: '3.5%',
    earned: '$1,425.00',
    lockPeriod: 'Contract-based',
    status: 'Held',
    progress: 100,
    color: 'yellow',
  },
]

const transactions = [
  { date: 'Apr 20, 2026', type: 'Interest', vault: 'High-Yield Reserve', amount: '+$937.50', status: 'Credited' },
  { date: 'Apr 15, 2026', type: 'Deposit', vault: 'Fixed Term Vault', amount: '+$25,000.00', status: 'Completed' },
  { date: 'Apr 10, 2026', type: 'Interest', vault: 'Fixed Term Vault', amount: '+$900.00', status: 'Credited' },
  { date: 'Apr 1, 2026', type: 'Interest', vault: 'Security Deposit', amount: '+$248.75', status: 'Credited' },
]

export default function SavingsVaultPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Savings <span className="text-gradient-primary">Vault</span>
          </h1>
          <p className="text-slate-400 mt-1">Secure your assets and earn competitive yields with GEM vaults.</p>
        </div>
        <Button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
          <Plus className="w-4 h-4 mr-2" />
          Open New Vault
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vaultSummary.map(({ label, value, change, isPositive, icon: Icon }) => (
          <Card key={label} className="bg-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                {change && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Banner */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Enterprise-Grade Security</p>
            <p className="text-xs text-slate-400 mt-0.5">
              All vaults are protected by multi-signature authorization, insurance coverage up to $10M, and 24/7 monitoring.
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">Protected</Badge>
        </CardContent>
      </Card>

      {/* Vault Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Landmark className="w-5 h-5 text-cyan-400" />
          Your Vaults
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {vaults.map((vault) => (
            <Card key={vault.name} className={`bg-card border-white/10 hover:border-${vault.color}-500/30 transition-colors group`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      vault.color === 'cyan' ? 'bg-cyan-500/10' : vault.color === 'purple' ? 'bg-purple-500/10' : 'bg-yellow-500/10'
                    }`}>
                      {vault.type === 'Locked' ? (
                        <Lock className={`w-4 h-4 ${vault.color === 'cyan' ? 'text-cyan-400' : vault.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />
                      ) : vault.type === 'Escrow' ? (
                        <Shield className={`w-4 h-4 ${vault.color === 'cyan' ? 'text-cyan-400' : vault.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />
                      ) : (
                        <PiggyBank className={`w-4 h-4 ${vault.color === 'cyan' ? 'text-cyan-400' : vault.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-sm text-white">{vault.name}</CardTitle>
                      <CardDescription className="text-xs">{vault.type}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`text-xs ${
                    vault.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    vault.status === 'Locked' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {vault.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Balance</span>
                    <span className="text-sm font-bold text-white">{vault.balance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">APY</span>
                    <span className="text-sm font-semibold text-green-400">{vault.apy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Earned</span>
                    <span className="text-sm font-medium text-cyan-400">{vault.earned}</span>
                  </div>
                </div>

                {vault.type === 'Locked' && vault.maturityDate && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Maturity
                      </span>
                      <span className="text-slate-300">{vault.maturityDate}</span>
                    </div>
                    <Progress value={vault.progress} className="h-1.5 bg-white/10" />
                    <p className="text-[10px] text-slate-500 text-right">{vault.progress}% complete</p>
                  </div>
                )}

                <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/5 text-xs group-hover:text-cyan-400">
                  Manage Vault
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Vault Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg glass-panel">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'Interest' ? 'bg-green-500/10' : 'bg-cyan-500/10'
                  }`}>
                    {tx.type === 'Interest' ? (
                      <Percent className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{tx.type}</p>
                    <p className="text-xs text-slate-400">{tx.vault}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{tx.amount}</p>
                  <p className="text-xs text-slate-500">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
