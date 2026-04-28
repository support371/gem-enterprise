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
  Percent
} from 'lucide-react'

const vaults = [
  { name: 'Primary Reserve', type: 'Savings', balance: '45,000', apy: '4.5%', earned: ',240', status: 'Active', color: 'cyan' },
  { name: 'Q3 Tax Lock', type: 'Locked', balance: '20,000', apy: '5.2%', earned: '90', status: 'Locked', maturityDate: 'Sep 30, 2026', progress: 65, color: 'purple' },
  { name: 'Estate Escrow', type: 'Escrow', balance: '50,000', apy: '3.8%', earned: ',100', status: 'Pending', color: 'yellow' },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Savings <span className="text-cyan-400">Vault</span>
          </h1>
          <p className="text-slate-400 mt-1">Secure institutional-grade savings and escrow management.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
            Create New Vault
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-cyan-400" />
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Landmark className="w-5 h-5 text-cyan-400" />
          Your Vaults
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {vaults.map((vault) => (
            <Card key={vault.name} className="bg-slate-900/50 border-white/10 hover:border-cyan-500/30 transition-colors group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center`}>
                      {vault.type === 'Locked' ? (
                        <Lock className="w-4 h-4 text-cyan-400" />
                      ) : vault.type === 'Escrow' ? (
                        <Shield className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <PiggyBank className="w-4 h-4 text-cyan-400" />
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

      <Card className="bg-slate-900/50 border-white/10">
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
    </div>
  )
}
