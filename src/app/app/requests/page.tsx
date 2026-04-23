'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClipboardList, Send, CheckCircle2 } from 'lucide-react'

const existingRequests = [
  { id: 'REQ-0042', type: 'Portfolio Rebalance', subject: 'Q1 2026 rebalance request', status: 'Completed', created: 'Mar 1, 2026' },
  { id: 'REQ-0038', type: 'Document Request', subject: 'Request for Q4 statement', status: 'Completed', created: 'Jan 5, 2026' },
  { id: 'REQ-0035', type: 'Product Inquiry', subject: 'SOC Access upgrade inquiry', status: 'In Review', created: 'Dec 20, 2025' },
  { id: 'REQ-0031', type: 'Allocation Change', subject: 'Increase financial allocation 5%', status: 'Pending', created: 'Dec 15, 2025' },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    'In Review': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return <Badge className={map[status] ?? 'bg-slate-500/20 text-slate-400'}>{status}</Badge>
}

export default function RequestsPage() {
  const [requestType, setRequestType] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setRequestType('')
      setSubject('')
      setDescription('')
    }, 3000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Service <span className="text-gradient-primary">Requests</span>
        </h1>
        <p className="text-slate-400 mt-1">Submit and track your service requests.</p>
      </div>

      {/* Submit form */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-400" />
            Submit New Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
              <p className="text-white font-semibold">Request Submitted</p>
              <p className="text-slate-400 text-sm">Your request has been received and is under review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Request Type</Label>
                <Select value={requestType} onValueChange={setRequestType} required>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/10">
                    <SelectItem value="portfolio-rebalance">Portfolio Rebalance</SelectItem>
                    <SelectItem value="allocation-change">Allocation Change</SelectItem>
                    <SelectItem value="document-request">Document Request</SelectItem>
                    <SelectItem value="product-inquiry">Product Inquiry</SelectItem>
                    <SelectItem value="account-update">Account Update</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Subject</Label>
                <Input
                  placeholder="Brief summary of your request"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  placeholder="Provide details about your request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[100px]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold">
                  <Send className="w-4 h-4 mr-2" /> Submit Request
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Requests table */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            Request History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">ID</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Subject</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {existingRequests.map((req) => (
                <TableRow key={req.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-mono text-cyan-400 text-sm">{req.id}</TableCell>
                  <TableCell>
                    <Badge className="bg-white/10 text-slate-300 border-white/10 text-xs">{req.type}</Badge>
                  </TableCell>
                  <TableCell className="text-white text-sm">{req.subject}</TableCell>
                  <TableCell>{statusBadge(req.status)}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{req.created}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
