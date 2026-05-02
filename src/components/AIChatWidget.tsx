"use client"

import { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ShieldAlert,
  AlertCircle,
  Phone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// ── Types ─────────────────────────────────────────────────────────────────────

type ChatPhase = 'closed' | 'disclosure' | 'active' | 'escalated'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  at: string
  restricted?: boolean
}

// ── Shared Disclosure Screen ──────────────────────────────────────────────────

function DisclosureScreen({ onAccept, onDecline }: { onAccept: () => void, onDecline: () => void }) {
  const disclosureText = process.env.NEXT_PUBLIC_AI_DISCLOSURE_TEXT || "GEM Concierge is an AI assistant. It does not provide legal, financial, or investment advice."

  return (
    <div className="p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
        <ShieldCheck className="w-6 h-6 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">AI Interaction Disclosure</h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        {disclosureText}
      </p>
      <div className="pt-4 flex flex-col gap-2">
        <Button onClick={onAccept} className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
          Accept & Continue
        </Button>
        <Button variant="ghost" onClick={onDecline} className="text-slate-500 hover:text-white">
          Decline
        </Button>
      </div>
    </div>
  )
}

// ── Shared Escalation Screen ──────────────────────────────────────────────────

function EscalationScreen({ reason, onClose }: { reason: string, onClose: () => void }) {
  return (
    <div className="p-6 space-y-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-6 h-6 text-yellow-500" />
      </div>
      <h3 className="text-lg font-semibold text-white">Advisor Transfer Required</h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        Your query involves a regulated matter or specialized domain that requires a human advisor.
        We have opened a priority case and a representative will follow up with you.
      </p>
      <div className="bg-white/5 rounded-lg p-3 text-left">
        <p className="text-[10px] text-slate-500 uppercase font-mono">Reason for escalation</p>
        <p className="text-xs text-yellow-200 mt-1">{reason}</p>
      </div>
      <div className="pt-4 flex flex-col gap-2">
        <Button variant="outline" size="sm" className="w-full border-white/10 text-slate-300 hover:text-white gap-2 text-xs">
          <Phone className="w-3.5 h-3.5" /> Request callback
        </Button>
        <a href="/app/requests">
          <Button variant="outline" size="sm" className="w-full border-white/10 text-slate-300 hover:text-white gap-2 text-xs">
            <ExternalLink className="w-3.5 h-3.5" /> Open a case instead
          </Button>
        </a>
      </div>
      <Button variant="ghost" size="sm" className="w-full text-slate-500 text-xs" onClick={onClose}>
        Close chat
      </Button>
    </div>
  )
}

// ── Main widget ───────────────────────────────────────────────────────────────

interface AIChatWidgetProps {
  profileId?: string
  profileName?: string
}

export function AIChatWidget({ profileId = 'PRF-005', profileName = 'Platform Support' }: AIChatWidgetProps) {
  const [phase, setPhase] = useState<ChatPhase>('closed')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [escalationReason, setEscalationReason] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const acceptDisclosure = async () => {
    try {
      const res = await fetch('/api/assistant/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          consentGiven: true,
          disclosureTextHash: 'sha256-mock-hash'
        })
      })

      const data = await res.json()
      if (data.ok) {
        setSessionId(data.sessionId)
        setPhase('active')
        setMessages([{
          id: 'sys-0',
          role: 'system',
          text: `Disclosure accepted. Session started. How can I help you today?`,
          at: new Date().toLocaleTimeString(),
        }])
      }
    } catch (error) {
      console.error('Failed to start session', error)
    }
  }

  const sendMessage = async () => {
    const text = draft.trim()
    if (!text || loading || !sessionId) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      at: new Date().toLocaleTimeString(),
    }

    setMessages(prev => [...prev, userMsg])
    setDraft('')
    setLoading(true)

    try {
      const res = await fetch('/api/assistant/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text })
      })

      const data = await res.json()

      if (!res.ok && data.escalate) {
        setEscalationReason(data.error || 'Restricted content detected')
        setMessages(prev => [...prev, {
          id: `esc-${Date.now()}`,
          role: 'assistant',
          text: 'This query requires a human advisor. Transferring you now...',
          at: new Date().toLocaleTimeString(),
          restricted: true,
        }])
        setTimeout(() => setPhase('escalated'), 1500)
        return
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'I received your message but encountered an error generating a response.',
        at: new Date().toLocaleTimeString(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error('Failed to send message', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (phase === 'closed') {
    return (
      <button
        onClick={() => setPhase('disclosure')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 text-black shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center z-50"
        aria-label="Open AI support chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 z-50 flex flex-col bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '520px' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <p className="text-xs font-semibold text-white">{profileName}</p>
        </div>
        <button onClick={() => setPhase('closed')} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-950/50">
        {phase === 'disclosure' && (
          <DisclosureScreen onAccept={acceptDisclosure} onDecline={() => setPhase('closed')} />
        )}
        {phase === 'escalated' && (
          <EscalationScreen reason={escalationReason} onClose={() => setPhase('closed')} />
        )}
        {phase === 'active' && (
          <div className="p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                  msg.role === 'user' ? 'bg-cyan-500/20 text-white border border-cyan-500/20' :
                  msg.role === 'system' ? 'bg-white/5 text-slate-500 italic mx-auto' :
                  'bg-white/10 text-white'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-slate-500 animate-pulse">Assistant is thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {phase === 'active' && (
        <div className="p-3 border-t border-white/10 bg-slate-900 flex gap-2">
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border-white/10 text-white text-xs"
          />
          <Button size="icon" onClick={sendMessage} disabled={!draft.trim() || loading} className="bg-cyan-500 text-black">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
