import Link from 'next/link'
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
import { Briefcase, TrendingUp, ArrowRight, PieChart } from 'lucide-react'

const portfolioSummary = [
  { label: 'Total Value', value: '$2,500,000' },
  { label: 'YTD Performance', value: '+8.4%' },
  { label: 'Total Positions', value: '7' },
  { label: 'Last Rebalanced', value: 'Mar 1, 2026' },
]

const allocations = [
  { category: 'Cybersecurity', pct: 45, value: '$1,125,000', color: 'bg-cyan-500', textColor: 'text-cyan-400' },
  { category: 'Financial', pct: 35, value: '$875,000', color: 'bg-purple-500', textColor: 'text-purple-400' },
  { category: 'Real Estate', pct: 20, value: '$500,000', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
]

const summaryRows = [
  { position: 'CyberShield Pro', category: 'Cybersecurity', weight: '25%', value: '$625,000', status: 'Active' },
  { position: 'Intelligence Feed', category: 'Cybersecurity', weight: '12%', value: '$300,000', status: 'Active' },
  { position: 'SOC Access', category: 'Cybersecurity', weight: '8%', value: '$200,000', status: 'Active' },
  { position: 'FinancialGuard', category: 'Financial', weight: '35%', value: '$875,000', status: 'Active' },
  { position: 'PropertyShield', category: 'Real Estate', weight: '20%', value: '$500,000', status: 'Active' },
]

export default function PortfoliosPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Your <span className="text-gradient-primary">Portfolios</span>
        </h1>
        <p className="text-slate-400 mt-1">View and manage your GEM Enterprise portfolio positions.</p>
      </div>

      {/* Portfolio card */}
      <Card className="bg-card border-white/10 glow-cyan">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-white">GEM Cyber-Financial Portfolio</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Portfolio ID: GEM-PORT-001</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              <Link href="/app/portfolios/GEM-PORT-001">
                <Button size="sm" className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30">
                  View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {portfolioSummary.map(({ label, value }) => (
              <div key={label} className="glass-panel rounded-lg p-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className={`text-base font-bold mt-1 ${value.startsWith('+') ? 'text-green-400' : 'text-white'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allocations breakdown */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            Allocations Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {allocations.map(({ category, pct, value, color, textColor }) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm text-slate-300">{category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${textColor}`}>{value}</span>
                  <span className="text-sm font-bold text-white w-10 text-right">{pct}%</span>
                </div>
              </div>
              <Progress value={pct} className="h-2 bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Portfolio summary table */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Position</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Weight</TableHead>
                <TableHead className="text-slate-400">Value</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryRows.map((row) => (
                <TableRow key={row.position} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-white font-medium text-sm">{row.position}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{row.category}</TableCell>
                  <TableCell className="text-slate-300 text-sm">{row.weight}</TableCell>
                  <TableCell className="text-cyan-400 font-semibold text-sm">{row.value}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{row.status}</Badge>
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
