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
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  BarChart3,
  Clock,
  ShieldCheck,
  Plus,
} from 'lucide-react'

const portfolioStats = [
  { 
    label: 'Total Portfolio Value', 
    value: '$2,847,500', 
    change: '+$125,000',
    trend: 'up',
    icon: DollarSign,
  },
  { 
    label: 'Monthly Returns', 
    value: '+4.6%', 
    change: '+0.8%',
    trend: 'up',
    icon: TrendingUp,
  },
  { 
    label: 'YTD Performance', 
    value: '+12.4%', 
    change: '+2.1%',
    trend: 'up',
    icon: BarChart3,
  },
  { 
    label: 'Risk Score', 
    value: 'Moderate', 
    change: 'Balanced',
    trend: 'neutral',
    icon: ShieldCheck,
  },
]

const holdings = [
  { 
    name: 'GEM CyberShield Fund', 
    type: 'Cybersecurity', 
    shares: '1,250', 
    price: '$812.40', 
    value: '$1,015,500',
    allocation: 35.7,
    change: '+2.4%',
    trend: 'up'
  },
  { 
    name: 'GEM Financial Services ETF', 
    type: 'Financial', 
    shares: '890', 
    price: '$645.50', 
    value: '$574,495',
    allocation: 20.2,
    change: '+1.8%',
    trend: 'up'
  },
  { 
    name: 'ATR Real Estate Trust', 
    type: 'Real Estate', 
    shares: '450', 
    price: '$1,120.00', 
    value: '$504,000',
    allocation: 17.7,
    change: '-0.5%',
    trend: 'down'
  },
  { 
    name: 'GEM High-Yield Bond Fund', 
    type: 'Fixed Income', 
    shares: '2,100', 
    price: '$185.75', 
    value: '$390,075',
    allocation: 13.7,
    change: '+0.3%',
    trend: 'up'
  },
  { 
    name: 'GEM Cash Management', 
    type: 'Cash', 
    shares: '363,430', 
    price: '$1.00', 
    value: '$363,430',
    allocation: 12.7,
    change: '+0.1%',
    trend: 'up'
  },
]

const recentTransactions = [
  { date: 'Apr 18, 2026', type: 'Buy', asset: 'GEM CyberShield Fund', amount: '+50 shares', value: '$40,620' },
  { date: 'Apr 15, 2026', type: 'Dividend', asset: 'ATR Real Estate Trust', amount: 'Quarterly', value: '$8,400' },
  { date: 'Apr 12, 2026', type: 'Sell', asset: 'GEM Growth Equity', amount: '-200 shares', value: '$52,300' },
  { date: 'Apr 10, 2026', type: 'Buy', asset: 'GEM Financial Services ETF', amount: '+100 shares', value: '$64,550' },
]

export default function MyPortfolioPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                <TableHead className="text-slate-400 text-right">Shares</TableHead>
                <TableHead className="text-slate-400 text-right">Price</TableHead>
                <TableHead className="text-slate-400 text-right">Value</TableHead>
                <TableHead className="text-slate-400 text-right">Allocation</TableHead>
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
