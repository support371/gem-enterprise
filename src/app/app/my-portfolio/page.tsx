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
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Target, Calendar } from 'lucide-react'

const portfolioMetrics = [
  { label: 'Total Balance', value: '$1,245,890.50', change: '+5.2%', isPositive: true, icon: Wallet },
  { label: 'Monthly Return', value: '+$42,350', change: '+3.4%', isPositive: true, icon: TrendingUp },
  { label: 'Active Positions', value: '12', change: '+2', isPositive: true, icon: Activity },
  { label: 'Pending Orders', value: '3', change: '-1', isPositive: false, icon: Target },
]

const holdings = [
  { asset: 'GEM Cyber Fund', type: 'Fund', quantity: '500 units', value: '$450,000', allocation: 36, change: '+8.2%', isPositive: true },
  { asset: 'ATR Property Trust', type: 'REIT', quantity: '1,200 units', value: '$360,000', allocation: 29, change: '+4.1%', isPositive: true },
  { asset: 'Financial Shield', type: 'Product', quantity: '1 license', value: '$185,890', allocation: 15, change: '+2.3%', isPositive: true },
  { asset: 'Intel Premium', type: 'Subscription', quantity: '12 mo', value: '$125,000', allocation: 10, change: '+0.8%', isPositive: true },
  { asset: 'Cash Reserve', type: 'Cash', quantity: '-', value: '$125,000.50', allocation: 10, change: '0%', isPositive: true },
]

const recentActivity = [
  { date: 'Apr 18, 2026', action: 'Dividend Received', asset: 'ATR Property Trust', amount: '+$4,200', type: 'credit' },
  { date: 'Apr 15, 2026', action: 'Position Added', asset: 'GEM Cyber Fund', amount: '+50 units', type: 'buy' },
  { date: 'Apr 10, 2026', action: 'Subscription Renewed', asset: 'Intel Premium', amount: '-$10,000', type: 'debit' },
  { date: 'Apr 5, 2026', action: 'Yield Payment', asset: 'Financial Shield', amount: '+$2,890', type: 'credit' },
]

export default function MyPortfolioPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            My <span className="text-gradient-primary">Portfolio</span>
          </h1>
          <p className="text-slate-400 mt-1">Your personal investment dashboard and holdings overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
            <Clock className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          <p className="text-slate-400 mt-1">Your personal investment summary and holdings overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5">
            <Calendar className="w-4 h-4 mr-2" />
            Statement
          </Button>
          <Button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
            <DollarSign className="w-4 h-4 mr-2" />
            Deposit Funds
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map((stat) => (
          <Card key={stat.label} className="bg-card border-white/10 glow-cyan">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    stat.trend === 'up' ? 'text-green-400' : 
                    stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                    {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Holdings Table */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-white">Holdings</CardTitle>
                <CardDescription className="text-slate-400">Your current investment positions</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              5 Active Holdings
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Asset</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Quantity</TableHead>
                <TableHead className="text-slate-400">Value</TableHead>
                <TableHead className="text-slate-400">Allocation</TableHead>
                <TableHead className="text-slate-400 text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.name} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{holding.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 text-slate-400">
                      {holding.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300 text-right">{holding.shares}</TableCell>
                  <TableCell className="text-slate-300 text-right">{holding.price}</TableCell>
                  <TableCell className="text-cyan-400 font-semibold text-right">{holding.value}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={holding.allocation} className="h-1.5 w-16 bg-white/10" />
                      <span className="text-slate-300 text-sm w-12">{holding.allocation}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`flex items-center justify-end gap-1 font-medium ${
                      holding.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holding.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {holding.change}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Asset</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400 text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx, idx) => (
                <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-slate-400 text-sm">{tx.date}</TableCell>
                  <TableCell>
                    <Badge className={`${
                      tx.type === 'Buy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      tx.type === 'Sell' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white font-medium">{tx.asset}</TableCell>
                  <TableCell className="text-slate-300">{tx.amount}</TableCell>
                  <TableCell className="text-cyan-400 font-semibold text-right">{tx.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
