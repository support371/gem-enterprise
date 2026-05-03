'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Plus, Send, X, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  subject: string
  status: string
  scheduledAt: string | null
  sentAt: string | null
  recipientCount: number
  createdAt: string
}

const statusColor: Record<string, string> = {
  DRAFT:     'bg-slate-500/20 text-slate-300',
  SCHEDULED: 'bg-blue-500/20 text-blue-400',
  SENDING:   'bg-yellow-500/20 text-yellow-400',
  SENT:      'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/campaigns')
      const data = await res.json()
      if (data.campaigns) setCampaigns(data.campaigns)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  async function sendCampaign(id: string) {
    setSending(id)
    try {
      await fetch(`/api/admin/campaigns/${id}/send`, { method: 'POST' })
      await fetchCampaigns()
    } finally {
      setSending(null)
    }
  }

  async function cancelCampaign(id: string) {
    await fetch(`/api/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    })
    await fetchCampaigns()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-cyan-400" />
            Email Campaigns
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Create and send campaigns to all active users.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCampaigns} className="border-white/10 text-slate-300 gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Link href="/app/admin/campaigns/new">
            <Button size="sm" className="bg-cyan-500 text-black hover:opacity-90 gap-2">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No campaigns yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">{c.title}</p>
                      <Badge className={`text-xs ${statusColor[c.status] ?? 'bg-white/10 text-slate-300'}`}>
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.subject}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {c.sentAt
                        ? `Sent ${new Date(c.sentAt).toLocaleDateString()} · ${c.recipientCount} recipients`
                        : c.scheduledAt
                        ? `Scheduled for ${new Date(c.scheduledAt).toLocaleString()}`
                        : `Created ${new Date(c.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => sendCampaign(c.id)}
                          disabled={sending === c.id}
                          className="bg-cyan-500 text-black hover:opacity-90 text-xs gap-1.5"
                        >
                          {sending === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Send Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelCampaign(c.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
