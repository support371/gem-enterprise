import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Download, CheckCircle2 } from 'lucide-react'

type Doc = {
  name: string
  type: 'Agreement' | 'KYC' | 'Statement' | 'Compliance'
  date: string
  status: 'Available' | 'Pending'
}

const documents: Doc[] = [
  { name: 'Onboarding Agreement', type: 'Agreement', date: 'Jan 10, 2026', status: 'Available' },
  { name: 'KYC Approval Letter', type: 'KYC', date: 'Jan 12, 2026', status: 'Available' },
  { name: 'Q1 Portfolio Statement', type: 'Statement', date: 'Mar 15, 2026', status: 'Available' },
  { name: 'Privacy Policy Acknowledgment', type: 'Compliance', date: 'Jan 10, 2026', status: 'Available' },
  { name: 'Terms of Service Agreement', type: 'Agreement', date: 'Jan 10, 2026', status: 'Available' },
  { name: 'AML Notice Acknowledgment', type: 'Compliance', date: 'Jan 11, 2026', status: 'Available' },
  { name: 'Investment Suitability Form', type: 'KYC', date: 'Jan 9, 2026', status: 'Available' },
  { name: 'Q4 2025 Portfolio Statement', type: 'Statement', date: 'Dec 31, 2025', status: 'Available' },
]

function typeBadge(type: Doc['type']) {
  const map: Record<Doc['type'], string> = {
    Agreement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    KYC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Statement: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Compliance: 'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return <Badge className={map[type]}>{type}</Badge>
}

function DocsTable({ docs }: { docs: Doc[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="text-slate-400">Name</TableHead>
          <TableHead className="text-slate-400">Type</TableHead>
          <TableHead className="text-slate-400">Date</TableHead>
          <TableHead className="text-slate-400">Status</TableHead>
          <TableHead className="text-slate-400">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {docs.map((doc) => (
          <TableRow key={doc.name} className="border-white/5 hover:bg-white/5">
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-white text-sm font-medium">{doc.name}</span>
              </div>
            </TableCell>
            <TableCell>{typeBadge(doc.type)}</TableCell>
            <TableCell className="text-slate-400 text-sm">{doc.date}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 text-xs">{doc.status}</span>
              </div>
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs gap-1.5"
              >
                <Download className="w-3 h-3" /> Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Your <span className="text-gradient-primary">Documents</span>
        </h1>
        <p className="text-slate-400 mt-1">Access and download all your GEM Enterprise documents.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: '8' },
          { label: 'Agreements', value: '2' },
          { label: 'Statements', value: '2' },
          { label: 'KYC / Compliance', value: '4' },
        ].map(({ label, value }) => (
          <div key={label} className="glass-panel rounded-xl p-4 text-center bento-card">
            <p className="text-2xl font-bold text-cyan-400">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="bg-white/5 border border-white/10 mb-6">
              {['all', 'agreements', 'statements', 'kyc', 'compliance'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="capitalize data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                >
                  {tab === 'kyc' ? 'KYC' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <DocsTable docs={documents} />
            </TabsContent>
            <TabsContent value="agreements">
              <DocsTable docs={documents.filter((d) => d.type === 'Agreement')} />
            </TabsContent>
            <TabsContent value="statements">
              <DocsTable docs={documents.filter((d) => d.type === 'Statement')} />
            </TabsContent>
            <TabsContent value="kyc">
              <DocsTable docs={documents.filter((d) => d.type === 'KYC')} />
            </TabsContent>
            <TabsContent value="compliance">
              <DocsTable docs={documents.filter((d) => d.type === 'Compliance')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
