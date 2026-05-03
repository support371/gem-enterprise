'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Key, Plus, Copy, Eye, EyeOff, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ApiKey {
  id: string
  label: string
  keyPrefix: string
  lastUsedAt: string | null
  revokedAt: string | null
  createdAt: string
}

export default function DeveloperSecurityPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyLabel, setNewKeyLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKeyPlaintext, setNewKeyPlaintext] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/developers/keys')
      const data = await res.json()
      if (data.keys) setKeys(data.keys)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  async function createKey(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/developers/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel }),
      })
      const data = await res.json()
      if (data.plaintext) {
        setNewKeyPlaintext(data.plaintext)
        setNewKeyLabel('')
        await fetchKeys()
      }
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(id: string) {
    await fetch(`/api/developers/keys/${id}`, { method: 'DELETE' })
    await fetchKeys()
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/developers">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-cyan-400" />
            API Keys
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your API keys for programmatic access.</p>
        </div>
      </div>

      {newKeyPlaintext && (
        <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-sm font-semibold text-green-300">API key created — copy it now</p>
          </div>
          <p className="text-xs text-green-400/80">This key will not be shown again. Store it securely.</p>
          <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
            <code className="flex-1 text-xs font-mono text-green-300 break-all">{newKeyPlaintext}</code>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 text-green-400"
              onClick={() => copyToClipboard(newKeyPlaintext, 'new')}
            >
              {copiedId === 'new' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setNewKeyPlaintext(null)} className="border-green-500/30 text-green-400">
            Done
          </Button>
        </div>
      )}

      {/* Create key form */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Create New API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createKey} className="flex gap-3">
            <Input
              value={newKeyLabel}
              onChange={e => setNewKeyLabel(e.target.value)}
              placeholder="Key label (e.g. Production, Staging)"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 flex-1"
              required
            />
            <Button type="submit" disabled={creating} className="bg-cyan-500 text-black hover:opacity-90 shrink-0">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {creating ? 'Creating…' : 'Create Key'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Keys list */}
      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Active Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading keys…
            </div>
          ) : keys.filter(k => !k.revokedAt).length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No active API keys. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {keys.filter(k => !k.revokedAt).map(key => (
                <div key={key.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{key.label}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{key.keyPrefix}••••••••••••••••••••</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt ? ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : ' · Never used'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeKey(key.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
