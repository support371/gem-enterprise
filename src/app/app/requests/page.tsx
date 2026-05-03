'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { ClipboardList, Send, CheckCircle2, Loader2 } from 'lucide-react'

interface ServiceRequest {
  id: string
  type: string
  subject: string
  status: string
  priority: string
  createdAt: string
}

const statusColor: Record<string, string> = {
  open:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed:   'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled:   'bg-red-500/20 text-red-400 border-red-500/30',
  pending_info:'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export default function RequestsPage() {
  const [requestType, setRequestType] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/requests')
      const data = await res.json()
      if (data.requests) setRequests(data.requests)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: requestType, subject, description }),
      })
      if (res.ok) {
        setSubmitted(true)
        setRequestType('')
        setSubject('')
        setDescription('')
        await fetchRequests()
        setTimeout(() => setSubmitted(false), 4000)
      }
    } finally {
      setSubmitting(false)
    }
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
                  onChange={e => setSubject(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  placeholder="Provide details about your request..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[100px]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting} className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {submitting ? 'Submitting…' : 'Submit Request'}
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
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading requests…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Subject</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">No requests yet. Submit one above.</TableCell>
                  </TableRow>
                )}
                {requests.map(req => (
                  <TableRow key={req.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <Badge className="bg-white/10 text-slate-300 border-white/10 text-xs">{req.type.replace('-', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-white text-sm">{req.subject}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColor[req.status] ?? 'bg-slate-500/20 text-slate-400'} text-xs`}>
                        {req.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
