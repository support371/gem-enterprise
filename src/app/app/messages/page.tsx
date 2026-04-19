'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, Shield, DollarSign, Building2, User, Search, Lock } from 'lucide-react'

interface Thread {
  id: string
  subject: string
  participant: string
  role: string
  lastMessage: string
  lastAt: string
  unread: number
  domain: 'cyber' | 'financial' | 'realty' | 'general'
  messages: Array<{ from: 'client' | 'advisor'; text: string; at: string }>
}

const threads: Thread[] = [
  {
    id: 'T-001', subject: 'Q1 threat summary review',
    participant: 'J. Martinez', role: 'Security Advisor',
    lastMessage: 'The Q1 threat summary is ready for your review. Three items require your acknowledgment before we close the period.',
    lastAt: '2h ago', unread: 1, domain: 'cyber',
    messages: [
      { from: 'advisor', text: 'The Q1 threat summary is ready for your review. Three items require your acknowledgment before we close the period.', at: 'Today, 10:22' },
      { from: 'client',  text: 'Thanks — I\'ll review this afternoon. Can you flag which ones are highest priority?', at: 'Today, 10:45' },
    ],
  },
  {
    id: 'T-002', subject: 'Portfolio rebalance discussion',
    participant: 'K. Osei', role: 'Financial Advisor',
    lastMessage: 'Based on the current allocation drift, we recommend moving 5% from Cybersecurity to Real Estate to align with your target.',
    lastAt: 'Yesterday', unread: 0, domain: 'financial',
    messages: [
      { from: 'advisor', text: 'Based on the current allocation drift, we recommend moving 5% from Cybersecurity to Real Estate to align with your target.', at: 'Yesterday, 14:30' },
    ],
  },
  {
    id: 'T-003', subject: 'ATR — 44 Elm Street update',
    participant: 'ATR Operations', role: 'Real Estate Team',
    lastMessage: 'County records are expected by Thursday. We\'ll notify you as soon as the title search is complete.',
    lastAt: '3 days ago', unread: 0, domain: 'realty',
    messages: [
      { from: 'advisor', text: 'County records are expected by Thursday. We\'ll notify you as soon as the title search is complete.', at: 'Mar 14, 10:30' },
    ],
  },
]

const domainColors = {
  cyber:     'text-[hsl(var(--svc-cyber))]',
  financial: 'text-[hsl(var(--svc-financial))]',
  realty:    'text-[hsl(var(--svc-realty))]',
  general:   'text-slate-400',
}

const domainIcons = {
  cyber:     Shield,
  financial: DollarSign,
  realty:    Building2,
  general:   MessageSquare,
}

export default function MessagesPage() {
  const [selected, setSelected] = useState<Thread | null>(threads[0])
  const [draft, setDraft] = useState('')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-slate-400 mt-1 text-sm flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Encrypted advisor communications
          </p>
        </div>
        <Badge className="bg-[hsl(var(--svc-cyber-muted))] text-[hsl(var(--svc-cyber))] border-0 text-xs">
          {threads.reduce((a, t) => a + t.unread, 0)} unread
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-16rem)]">

        {/* Thread list */}
        <div className="lg:col-span-1 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder="Search…" className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-xs h-8" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map(t => {
              const Icon = domainIcons[t.domain]
              const color = domainColors[t.domain]
              return (
                <div
                  key={t.id}
                  className={`p-3 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors ${selected?.id === t.id ? 'bg-white/8' : ''}`}
                  onClick={() => setSelected(t)}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-white truncate">{t.subject}</p>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-1">{t.lastAt}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{t.participant}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.lastMessage}</p>
                    </div>
                    {t.unread > 0 && (
                      <span className={`w-4 h-4 rounded-full ${color.replace('text-', 'bg-').replace('[hsl(var(', '').replace('))]', '')} flex items-center justify-center text-[9px] text-black font-bold shrink-0 bg-[hsl(var(--svc-cyber))]`}>
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Message thread */}
        {selected ? (
          <div className="lg:col-span-2 glass-panel rounded-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selected.participant}</p>
                <p className="text-xs text-slate-500">{selected.role} · {selected.subject}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selected.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-xl p-3 ${msg.from === 'client' ? 'bg-[hsl(var(--svc-cyber-muted))] border border-[hsl(var(--svc-cyber))]/20' : 'bg-white/5'}`}>
                    <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                    <p className="text-[10px] text-slate-500 mt-1.5">{msg.at}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Compose */}
            <div className="p-3 border-t border-white/10 flex gap-2">
              <Textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Type a secure message…"
                rows={2}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm resize-none"
              />
              <Button size="sm" className="self-end bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 glass-panel rounded-xl flex items-center justify-center">
            <p className="text-slate-500 text-sm">Select a thread to read</p>
          </div>
        )}

      </div>
    </div>
  )
}
