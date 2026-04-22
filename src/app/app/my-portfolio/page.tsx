import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            My <span className="text-gradient-primary">Portfolio</span>
          </h1>
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioMetrics.map(({ label, value, change, isPositive, icon: Icon }) => (
          <Card key={label} className="bg-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {change}
                </div>
              </div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Holdings Table */}
      <Card className="bg-card border-white/10 glow-cyan">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            Current Holdings
          </CardTitle>
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
                <TableRow key={holding.asset} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-white font-medium text-sm">{holding.asset}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
                      {holding.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">{holding.quantity}</TableCell>
                  <TableCell className="text-cyan-400 font-semibold text-sm">{holding.value}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={holding.allocation} className="h-1.5 w-16 bg-white/10" />
                      <span className="text-slate-300 text-xs w-8">{holding.allocation}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`flex items-center justify-end gap-1 text-sm font-medium ${holding.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {holding.change}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg glass-panel">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'credit' ? 'bg-green-500/10' : activity.type === 'buy' ? 'bg-cyan-500/10' : 'bg-red-500/10'
                  }`}>
                    {activity.type === 'credit' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                    ) : activity.type === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{activity.action}</p>
                    <p className="text-xs text-slate-400">{activity.asset}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    activity.type === 'credit' || activity.type === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {activity.amount}
                  </p>
                  <p className="text-xs text-slate-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
