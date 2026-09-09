'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Mail, Send, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { renderGemCampaignEmail } from '@/lib/email/gemCampaignTemplate'

export default function NewCampaignPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const previewEmail = renderGemCampaignEmail({
    subject: subject || 'Your campaign subject',
    body: body || 'Your campaign content will appear here.',
  })

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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
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

      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" />
        <div>
          <p className="text-sm font-semibold text-amber-200">GEM Enterprise branded delivery enforced</p>
          <p className="text-xs leading-5 text-slate-400 mt-1">
            Every campaign is delivered through the approved navy, gold, and white GEM email template with a mobile-safe HTML version and plain-text fallback. The preview below uses the same renderer as production delivery.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
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
                  rows={12}
                  required
                  className="w-full rounded-md bg-white/5 border border-white/10 text-white placeholder:text-slate-500 p-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-600 mt-1">HTTP(S) links in the body are safely rendered as branded clickable links.</p>
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

        {/* Production-equivalent branded preview */}
        <Card className="bg-card border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-white text-sm">Branded Email Preview</CardTitle>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                Production renderer
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b border-white/10 bg-black/20 px-4 py-3 grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">From</p>
                <p className="text-slate-300 mt-1">GEM Enterprise &lt;noreply@gemcybersecurityassist.com&gt;</p>
              </div>
              <div>
                <p className="text-slate-500">Subject</p>
                <p className="text-slate-300 mt-1 break-words">{subject || 'Your campaign subject'}</p>
              </div>
            </div>
            <div className="bg-slate-100 p-3 sm:p-5">
              <iframe
                title="GEM branded campaign email preview"
                srcDoc={previewEmail.html}
                sandbox=""
                className="w-full h-[620px] rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
