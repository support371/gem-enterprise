'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Webhook, Plus, Globe, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DeveloperWebhooksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/developers">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Webhook className="w-6 h-6 text-cyan-400" />
            Webhooks
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure real-time event delivery to your endpoints.</p>
        </div>
        <Button size="sm" className="bg-cyan-500 text-black hover:opacity-90 gap-2" disabled>
          <Plus className="w-4 h-4" /> New Webhook
        </Button>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-300">Webhook management coming in v2</p>
          <p className="text-xs text-yellow-400/80 mt-1">
            Webhook registration, event filtering, and delivery logs are scheduled for the v2 release.
            Contact your account manager to join the early access list.
          </p>
        </div>
      </div>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Supported Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { event: 'kyc.approved',       desc: 'KYC application approved' },
              { event: 'kyc.rejected',        desc: 'KYC application rejected' },
              { event: 'ticket.created',      desc: 'New support ticket opened' },
              { event: 'ticket.resolved',     desc: 'Support ticket resolved' },
              { event: 'alert.triggered',     desc: 'Security alert triggered' },
              { event: 'incident.created',    desc: 'Incident case created' },
              { event: 'portfolio.updated',   desc: 'Portfolio allocation changed' },
              { event: 'document.available',  desc: 'New document available' },
            ].map(({ event, desc }) => (
              <div key={event} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-mono text-cyan-300">{event}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
