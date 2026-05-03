'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Download, CheckCircle2, Loader2 } from 'lucide-react'

interface KycDoc {
  id: string
  documentType: string
  fileName: string
  fileSize: number
  status: string
  createdAt: string
}

type DocRow = { id: string; name: string; type: string; date: string; status: string }

function typeBadge(type: string) {
  const map: Record<string, string> = {
    agreement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    identity: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    statement: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    compliance: 'bg-green-500/20 text-green-400 border-green-500/30',
    proof_of_address: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }
  const key = type.toLowerCase()
  const cls = map[key] ?? 'bg-white/10 text-slate-300'
  return <Badge className={cls}>{type.replace(/_/g, ' ')}</Badge>
}

function DocsTable({ docs }: { docs: DocRow[] }) {
  if (docs.length === 0) return <p className="text-sm text-slate-500 text-center py-6">No documents in this category.</p>
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
        {docs.map(doc => (
          <TableRow key={doc.id} className="border-white/5 hover:bg-white/5">
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
                <span className="text-green-400 text-xs capitalize">{doc.status}</span>
              </div>
            </TableCell>
            <TableCell>
              <Button size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs gap-1.5" disabled>
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
  const [docs, setDocs] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.documents) && d.documents.length > 0) {
          setDocs((d.documents as KycDoc[]).map(doc => ({
            id: doc.id,
            name: doc.fileName,
            type: doc.documentType,
            date: new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: doc.status,
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const kycDocs = docs.filter(d => ['identity', 'proof_of_address'].includes(d.type.toLowerCase()))
  const compliance = docs.filter(d => ['compliance', 'agreement'].includes(d.type.toLowerCase()))
  const statements = docs.filter(d => d.type.toLowerCase() === 'statement')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Your <span className="text-gradient-primary">Documents</span>
        </h1>
        <p className="text-slate-400 mt-1">Access all your GEM Enterprise documents.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: loading ? '…' : String(docs.length) },
          { label: 'KYC / Identity', value: loading ? '…' : String(kycDocs.length) },
          { label: 'Statements', value: loading ? '…' : String(statements.length) },
          { label: 'Compliance', value: loading ? '…' : String(compliance.length) },
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
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading documents…
            </div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No documents available yet. Documents will appear here once your KYC is complete.</p>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="bg-white/5 border border-white/10 mb-6">
                {['all', 'kyc', 'statements', 'compliance'].map(tab => (
                  <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                    {tab === 'kyc' ? 'KYC' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="all"><DocsTable docs={docs} /></TabsContent>
              <TabsContent value="kyc"><DocsTable docs={kycDocs} /></TabsContent>
              <TabsContent value="statements"><DocsTable docs={statements} /></TabsContent>
              <TabsContent value="compliance"><DocsTable docs={compliance} /></TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
