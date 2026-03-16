import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Briefcase, TrendingUp, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Props {
  params: Promise<{ portfolioId: string }>
}

const holdings = [
  { position: 'CyberShield Pro', category: 'Cybersecurity', allocation: '25%', value: '$625,000', change: '+3.2%', up: true },
  { position: 'Intelligence Feed', category: 'Cybersecurity', allocation: '12%', value: '$300,000', change: '+1.8%', up: true },
  { position: 'SOC Access', category: 'Cybersecurity', allocation: '8%', value: '$200,000', change: '+0.5%', up: true },
  { position: 'FinancialGuard', category: 'Financial', allocation: '35%', value: '$875,000', change: '+12.4%', up: true },
  { position: 'PropertyShield', category: 'Real Estate', allocation: '20%', value: '$500,000', change: '-1.2%', up: false },
]

const transactions = [
  { date: 'Mar 1, 2026', type: 'Rebalance', description: 'Quarterly portfolio rebalance', amount: '+$45,000' },
  { date: 'Feb 1, 2026', type: 'Allocation', description: 'FinancialGuard position increase', amount: '+$75,000' },
  { date: 'Jan 15, 2026', type: 'Dividend', description: 'Q4 2025 performance distribution', amount: '+$12,500' },
  { date: 'Jan 1, 2026', type: 'Rebalance', description: 'Annual rebalance — start of year', amount: '-$20,000' },
]

const docs = [
  { name: 'Q1 2026 Portfolio Statement', date: 'Mar 15, 2026', type: 'Statement' },
  { name: 'Investment Management Agreement', date: 'Jan 10, 2026', type: 'Agreement' },
  { name: 'Annual Allocation Report 2025', date: 'Dec 31, 2025', type: 'Report' },
]

export default async function PortfolioDetailPage({ params }: Props) {
  const { portfolioId } = await params

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-gradient-primary">GEM Cyber-Financial Portfolio</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{portfolioId}</p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">Active</Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: '$2,500,000', sub: 'As of Mar 15, 2026' },
          { label: 'YTD Return', value: '+8.4%', sub: 'Year to date', positive: true },
          { label: 'Total Positions', value: '5', sub: 'Across 3 categories' },
          { label: 'Inception Date', value: 'Jan 2025', sub: 'Account opened' },
        ].map(({ label, value, sub, positive }) => (
          <div key={label} className="glass-panel rounded-xl p-5 bento-card">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-xl font-bold mt-1 ${positive ? 'text-green-400' : 'text-white'}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Holdings table */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Position</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Allocation %</TableHead>
                <TableHead className="text-slate-400">Value</TableHead>
                <TableHead className="text-slate-400">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((h) => (
                <TableRow key={h.position} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-white font-medium text-sm">{h.position}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{h.category}</TableCell>
                  <TableCell className="text-slate-300 text-sm">{h.allocation}</TableCell>
                  <TableCell className="text-cyan-400 font-semibold text-sm">{h.value}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {h.up ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${h.up ? 'text-green-400' : 'text-red-400'}`}>
                        {h.change}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Description</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t, i) => (
                <TableRow key={i} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-slate-300 text-sm">{t.date}</TableCell>
                  <TableCell>
                    <Badge className="bg-white/10 text-slate-300 border-white/10 text-xs">{t.type}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-300 text-sm">{t.description}</TableCell>
                  <TableCell
                    className={`font-semibold text-sm ${t.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {t.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Related documents */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Portfolio Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between py-3 px-4 glass-panel rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.date}</p>
                  </div>
                </div>
                <Badge className="bg-white/10 text-slate-300 border-white/10 text-xs">{doc.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
