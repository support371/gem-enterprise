'use client'

/**
 * AIChatWidget — Governed AI chat assistant component
 *
 * Governance requirements (Master Dossier §2, §7; ADR-003):
 * - Disclosure notice must be accepted before any message is sent
 * - Restricted response classes (LEGAL_ADVICE, FINANCIAL_ADVICE, SECURITY_CLOSURE,
 *   IDENTITY_DETERMINATION) trigger escalation, not a model response
 * - Every session creates an AiRun record (via /api/assistant/session)
 * - ConsentRecord is written on disclosure acceptance
 * - Transcript pointer logged on session end
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare, X, Send, Bot, AlertCircle, CheckCircle2,
  User, Lock, ChevronDown, Phone, ExternalLink, Shield,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ChatPhase = 'closed' | 'disclosure' | 'active' | 'escalated'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  at: string
  restricted?: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Disclosure text is read from env var at runtime so legal can update
 * without a code deploy. Falls back to the standard notice.
 * Source: ADR-003 §Disclosure requirement
 */
const DISCLOSURE_TEXT =
  process.env.NEXT_PUBLIC_AI_DISCLOSURE_TEXT ??
  'You are interacting with an AI-assisted support system. This assistant can answer general questions and help you submit requests. It cannot provide legal, financial, or cybersecurity advice. A qualified human advisor will review any regulated matter.'

/**
 * Restricted keywords — triggers human escalation.
 * In production these patterns are evaluated server-side in /api/assistant/message.
 * This client-side check is a fast-path UX guard only.
 */
const RESTRICTED_PATTERNS = [
  /\b(legal advice|lawsuit|sue|litigation|attorney|solicitor)\b/i,
  /\b(invest|investment advice|portfolio recommendation|buy (this|that) stock)\b/i,
  /\b(breach confirmed|incident closed|all clear|no threat)\b/i,
  /\b(identity confirmed|verified identity|no fraud)\b/i,
]

function detectRestricted(text: string): boolean {
  return RESTRICTED_PATTERNS.some(p => p.test(text))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DisclosureScreen({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="w-5 h-5 text-[hsl(var(--svc-cyber))]" />
        <p className="text-sm font-semibold text-white">Before we begin</p>
      </div>

      <div className="bg-[hsl(var(--svc-cyber-muted))] border border-[hsl(var(--svc-cyber))]/20 rounded-xl p-4">
        <p className="text-xs text-slate-200 leading-relaxed">{DISCLOSURE_TEXT}</p>
      </div>

      <div className="space-y-2 text-xs text-slate-400">
        <p className="flex items-start gap-1.5"><Lock className="w-3 h-3 shrink-0 mt-0.5 text-[hsl(var(--svc-cyber))]" /> This session is logged for quality and compliance purposes.</p>
        <p className="flex items-start gap-1.5"><Shield className="w-3 h-3 shrink-0 mt-0.5 text-[hsl(var(--svc-cyber))]" /> Regulated matters are escalated to a verified human advisor.</p>
        <p className="flex items-start gap-1.5"><AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-yellow-400" /> This is not a substitute for professional legal, financial, or security advice.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-slate-400 hover:text-white text-xs"
          onClick={onDecline}
        >
          Decline
        </Button>
        <Button
          size="sm"
          className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 text-xs"
          onClick={onAccept}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> I Understand — Continue
        </Button>
      </div>
    </div>
  )
}

function EscalationScreen({ reason, onClose }: { reason: string; onClose: () => void }) {
  return (
    <div className="p-5 space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-sm font-semibold text-yellow-300">Human advisor required</p>
        </div>
        <p className="text-xs text-yellow-200 leading-relaxed">
          Your query touches a topic that requires review by a qualified human advisor. This conversation has been forwarded to the appropriate team.
        </p>
        {reason && (
          <p className="text-[10px] text-yellow-400 mt-2 font-mono">Reason: {reason}</p>
        )}
      </div>

      <div className="space-y-2">
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
  /** Profile governing this session (from governed profile registry) */
  profileId?: string
  profileName?: string
}

export function AIChatWidget({ profileId = 'PRF-005', profileName = 'Platform Support' }: AIChatWidgetProps) {
  const [phase, setPhase] = useState<ChatPhase>('closed')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalationReason, setEscalationReason] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const acceptDisclosure = () => {
    // In production: POST /api/assistant/session → creates AiRun + ConsentRecord
    // Assumption (ADR-003): consent recorded server-side before first message
    setPhase('active')
    setMessages([{
      id: 'sys-0',
      role: 'system',
      text: `Disclosure accepted. Session started with profile: ${profileName} (${profileId}). How can I help you today?`,
      at: new Date().toLocaleTimeString(),
    }])
  }

  const sendMessage = async () => {
    const text = draft.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      at: new Date().toLocaleTimeString(),
    }

    setMessages(prev => [...prev, userMsg])
    setDraft('')

    // Client-side restricted class fast-path check (ADR-003)
    if (detectRestricted(text)) {
      const escalateReason = 'Restricted response class detected in user message'
      setEscalationReason(escalateReason)
      setMessages(prev => [...prev, {
        id: `esc-${Date.now()}`,
        role: 'assistant',
        text: 'This query has been identified as requiring a qualified human advisor. I\'m transferring you now.',
        at: new Date().toLocaleTimeString(),
        restricted: true,
      }])
      // In production: POST /api/assistant/message would have already caught this
      // and created an escalation case before returning to client
      setTimeout(() => setPhase('escalated'), 1200)
      return
    }

    setLoading(true)

    try {
      // POST /api/assistant/message — handles model call, class detection, logging
      // Stubbed with a canned response until Sprint 4 AI integration
      await new Promise(r => setTimeout(r, 800))

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: getStubResponse(text),
        at: new Date().toLocaleTimeString(),
      }
      setMessages(prev => [...prev, assistantMsg])
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

  // ── Closed state ──
  if (phase === 'closed') {
    return (
      <button
        onClick={() => setPhase('disclosure')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[hsl(var(--svc-cyber))] text-black shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center z-50 glow-cyan"
        aria-label="Open AI support chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    )
  }

  // ── Open panel ──
  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 z-50 flex flex-col glass-panel rounded-2xl shadow-2xl overflow-hidden border border-white/10" style={{ maxHeight: '520px' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--svc-cyber-muted))] flex items-center justify-center">
            <Bot className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{profileName}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--svc-cyber))] animate-pulse-slow inline-block" />
              <p className="text-[10px] text-slate-400">AI-Assisted · Session logged</p>
            </div>
          </div>
        </div>
        <button onClick={() => setPhase('closed')} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {phase === 'disclosure' && (
          <DisclosureScreen onAccept={acceptDisclosure} onDecline={() => setPhase('closed')} />
        )}
        {phase === 'escalated' && (
          <EscalationScreen reason={escalationReason} onClose={() => setPhase('closed')} />
        )}
        {phase === 'active' && (
          <div className="p-4 space-y-3">
            {messages.map(msg => {
              if (msg.role === 'system') {
                return (
                  <div key={msg.id} className="text-center">
                    <p className="text-[10px] text-slate-500 bg-white/5 rounded-full px-3 py-1 inline-block">{msg.text}</p>
                  </div>
                )
              }
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[hsl(var(--svc-cyber-muted))] flex items-center justify-center shrink-0 mt-0.5">
                      {msg.restricted ? <AlertCircle className="w-3.5 h-3.5 text-yellow-400" /> : <Bot className="w-3.5 h-3.5 text-[hsl(var(--svc-cyber))]" />}
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-xl px-3 py-2.5 ${isUser ? 'bg-[hsl(var(--svc-cyber-muted))] border border-[hsl(var(--svc-cyber))]/20' : msg.restricted ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/8'}`}>
                    <p className="text-xs text-white leading-relaxed">{msg.text}</p>
                    <p className="text-[9px] text-slate-500 mt-1">{msg.at}</p>
                  </div>
                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                </div>
              )
            })}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--svc-cyber-muted))] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[hsl(var(--svc-cyber))]" />
                </div>
                <div className="bg-white/8 rounded-xl px-3 py-2.5">
                  <span className="text-xs text-slate-400">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Compose — only shown in active phase */}
      {phase === 'active' && (
        <div className="p-3 border-t border-white/10 shrink-0 flex gap-2">
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-xs"
          />
          <Button
            size="icon"
            className="w-8 h-8 bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 shrink-0"
            onClick={sendMessage}
            disabled={!draft.trim() || loading}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Stub responses (replaced by /api/assistant/message in Sprint 4) ───────────

function getStubResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('kyc') || lower.includes('verify'))
    return 'KYC verification is handled through the secure onboarding flow. Visit /kyc/start to begin or check your current status in your profile.'
  if (lower.includes('portfolio') || lower.includes('allocation'))
    return 'Your portfolio overview is available in the Portfolios section. For specific allocation advice, I\'ll connect you with your financial advisor.'
  if (lower.includes('document') || lower.includes('statement'))
    return 'Your documents are available under Documents in the left navigation. Recent statements are listed there.'
  if (lower.includes('support') || lower.includes('help') || lower.includes('case'))
    return 'I can help open a support case for you. Head to Cases in the navigation, or tell me more about the issue and I\'ll route it to the right team.'
  if (lower.includes('hello') || lower.includes('hi'))
    return 'Hello. How can I assist you today? I can help with account questions, document requests, and routing you to the right advisor.'
  return 'I\'ve noted your query. For detailed assistance, I\'ll create a case and route it to the appropriate team. Would you like me to do that?'
}
