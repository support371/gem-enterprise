'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Mail, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewCampaignPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          body,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.formErrors?.[0] ?? 'Failed to create campaign.')
        return
      }
      router.push('/app/admin/campaigns')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/app/admin/campaigns">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-cyan-400" />
            New Campaign
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Draft a campaign to send to all active users.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Campaign Title</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q1 Security Update"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email Subject</label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Important security update from GEM"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email Body</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write your email content here..."
                  rows={8}
                  required
                  className="w-full rounded-md bg-white/5 border border-white/10 text-white placeholder:text-slate-500 p-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Schedule (optional)</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                <p className="text-xs text-slate-600 mt-1">Leave blank to save as draft.</p>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full bg-cyan-500 text-black hover:opacity-90 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Creating…' : scheduledAt ? 'Schedule Campaign' : 'Save as Draft'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="border-b border-white/10 pb-3">
                <p className="text-xs text-slate-500">From</p>
                <p className="text-sm text-white">GEM Enterprise &lt;noreply@gemcybersecurityassist.com&gt;</p>
              </div>
              <div className="border-b border-white/10 pb-3">
                <p className="text-xs text-slate-500">Subject</p>
                <p className="text-sm text-white">{subject || <span className="text-slate-600">Your subject here</span>}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Body</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">
                  {body || <span className="text-slate-600">Your email content will appear here…</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
