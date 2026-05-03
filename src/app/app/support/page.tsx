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
import {
  HeadphonesIcon,
  Send,
  Mail,
  Phone,
  CheckCircle2,
  Eye,
  Loader2,
} from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  createdAt: string
}

const statusColor: Record<string, string> = {
  open:              'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_progress:       'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting_on_client: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  resolved:          'bg-green-500/20 text-green-400 border-green-500/30',
  closed:            'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const priorityColor: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-red-500/20 text-red-400 border-red-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:      'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('medium')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true)
    try {
      const res = await fetch('/api/ticket')
      const data = await res.json()
      if (data.tickets) setTickets(data.tickets)
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/ticket/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, priority, description }),
      })
      if (res.ok) {
        setSubmitted(true)
        setSubject('')
        setPriority('medium')
        setDescription('')
        await fetchTickets()
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
          Enterprise <span className="text-gradient-primary">Support</span>
        </h1>
        <p className="text-slate-400 mt-1">Create tickets and manage your support requests.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create ticket form */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                Create Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                  <p className="text-white font-semibold">Ticket Submitted</p>
                  <p className="text-slate-400 text-sm">Our team will respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Briefly describe your issue"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-white/10">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-slate-300">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of your issue..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[120px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-semibold"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    {submitting ? 'Submitting…' : 'Submit Ticket'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact methods */}
        <div className="space-y-4">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <HeadphonesIcon className="w-4 h-4 text-cyan-400" />
                Contact Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass-panel rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <p className="text-sm font-medium text-white">Email Support</p>
                </div>
                <p className="text-xs text-slate-400">support@gemcybersecurityassist.com</p>
                <p className="text-xs text-slate-500 mt-1">Response within 24 hours</p>
              </div>
              <div className="glass-panel rounded-lg p-4 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-red-400" />
                  <p className="text-sm font-medium text-white">Emergency Line</p>
                </div>
                <p className="text-xs text-slate-400">+1 (401) 702-2460</p>
                <p className="text-xs text-slate-500 mt-1">24/7 for critical incidents</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tickets table */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Your Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTickets ? (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading tickets…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">ID</TableHead>
                  <TableHead className="text-slate-400">Subject</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Priority</TableHead>
                  <TableHead className="text-slate-400">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">No tickets yet. Submit one above.</TableCell>
                  </TableRow>
                )}
                {tickets.map(t => (
                  <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-mono text-cyan-400 text-xs">{t.id.slice(0, 8)}…</TableCell>
                    <TableCell className="text-white text-sm">{t.subject}</TableCell>
                    <TableCell><Badge className={`${statusColor[t.status] ?? 'bg-slate-500/20 text-slate-400'} text-xs`}>{t.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell><Badge className={`${priorityColor[t.priority] ?? 'bg-slate-500/20 text-slate-400'} text-xs`}>{t.priority}</Badge></TableCell>
                    <TableCell className="text-slate-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
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
