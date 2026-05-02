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
import {
  HeadphonesIcon,
  Send,
  Mail,
  Phone,
  AlertCircle,
  Eye,
} from 'lucide-react'

const openTickets = [
  { id: 'GEM-2048', subject: 'Portfolio access issue', status: 'Open', priority: 'Medium', created: 'Mar 14, 2026' },
  { id: 'GEM-2031', subject: 'Document download error', status: 'In Progress', priority: 'Low', created: 'Mar 10, 2026' },
  { id: 'GEM-1987', subject: 'KYC document resubmission', status: 'Resolved', priority: 'High', created: 'Feb 28, 2026' },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return <Badge className={map[status] ?? 'bg-slate-500/20 text-slate-400'}>{status}</Badge>
}

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    High: 'bg-red-500/20 text-red-400 border-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  return <Badge className={map[priority] ?? 'bg-slate-500/20 text-slate-400'}>{priority}</Badge>
}

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSubject('')
      setPriority('')
      setDescription('')
    }, 3000)
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
                  <AlertCircle className="w-10 h-10 text-green-400" />
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
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="priority" className="text-slate-300">Priority</Label>
                    <Select value={priority} onValueChange={setPriority} required>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select priority" />
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
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[120px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-cyan-500 text-black hover:bg-cyan-400 font-semibold"
                  >
                    <Send className="w-4 h-4 mr-2" /> Submit Ticket
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
              <div className="glass-panel rounded-lg p-4">
                <p className="text-xs text-slate-400 text-center">
                  Enterprise clients receive dedicated advisor access. Contact your account manager directly for priority support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Open tickets table */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Your Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">ID</TableHead>
                <TableHead className="text-slate-400">Subject</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Priority</TableHead>
                <TableHead className="text-slate-400">Created</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openTickets.map((ticket) => (
                <TableRow key={ticket.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-mono text-cyan-400 text-sm">{ticket.id}</TableCell>
                  <TableCell className="text-white text-sm">{ticket.subject}</TableCell>
                  <TableCell>{statusBadge(ticket.status)}</TableCell>
                  <TableCell>{priorityBadge(ticket.priority)}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{ticket.created}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white text-xs gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
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
