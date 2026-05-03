'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Settings, Bell, Globe, Mail, Save, Loader2, CheckCircle2 } from 'lucide-react'

interface ProfileData {
  email: string
  profile: {
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    preferences?: {
      notifications?: Record<string, boolean>
      timezone?: string
      currency?: string
    } | null
  } | null
}

const DEFAULT_NOTIFICATIONS = {
  email_alerts:  true,
  sms_alerts:    false,
  case_updates:  true,
  approvals:     true,
  compliance:    true,
  marketing:     false,
}

const NOTIFICATION_LABELS: Record<string, string> = {
  email_alerts:  'Email alerts',
  sms_alerts:    'SMS alerts',
  case_updates:  'Case & request updates',
  approvals:     'Approval requests',
  compliance:    'Compliance reminders',
  marketing:     'Platform news & updates',
}

export default function SettingsPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [timezone, setTimezone] = useState('UTC-5 (Eastern)')
  const [currency, setCurrency] = useState('USD — US Dollar')
  const [savingContact, setSavingContact] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  useEffect(() => {
    fetch('/api/users/profile')
      .then(r => r.json())
      .then((d: ProfileData) => {
        setProfileData(d)
        setFirstName(d.profile?.firstName ?? '')
        setLastName(d.profile?.lastName ?? '')
        setPhone(d.profile?.phone ?? '')
        const prefs = d.profile?.preferences
        if (prefs?.notifications) {
          setNotifications({ ...DEFAULT_NOTIFICATIONS, ...prefs.notifications })
        }
        if (prefs?.timezone) setTimezone(prefs.timezone)
        if (prefs?.currency) setCurrency(prefs.currency)
      })
      .catch(() => {})
  }, [])

  async function saveContact(e: React.FormEvent) {
    e.preventDefault()
    setSavingContact(true)
    setContactSaved(false)
    try {
      await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone }),
      })
      setContactSaved(true)
      setTimeout(() => setContactSaved(false), 3000)
    } finally {
      setSavingContact(false)
    }
  }

  async function saveNotifications() {
    setSavingNotifs(true)
    setNotifSaved(false)
    const existing = profileData?.profile?.preferences ?? {}
    try {
      await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { ...existing, notifications, timezone, currency },
        }),
      })
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 3000)
    } finally {
      setSavingNotifs(false)
    }
  }

  const toggle = (k: keyof typeof notifications) =>
    setNotifications(prev => ({ ...prev, [k]: !prev[k] }))

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[hsl(var(--svc-cyber))]" />
          Settings
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your account preferences and notification rules.</p>
      </div>

      {/* Contact */}
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-[hsl(var(--svc-financial))]" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveContact} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">First name</label>
                <Input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Last name</label>
                <Input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Email address</label>
              <Input
                value={profileData?.email ?? ''}
                readOnly
                className="bg-white/5 border-white/10 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Phone (optional)</label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                type="tel"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={savingContact} className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 gap-2">
                {savingContact ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </Button>
              {contactSaved && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-[hsl(var(--svc-realty))]" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {(Object.keys(DEFAULT_NOTIFICATIONS) as (keyof typeof notifications)[]).map(key => (
            <div key={key}>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-300">{NOTIFICATION_LABELS[key]}</span>
                <button
                  onClick={() => toggle(key)}
                  className={`relative w-10 rounded-full transition-colors ${notifications[key] ? 'bg-[hsl(var(--svc-cyber))]' : 'bg-white/10'}`}
                  style={{ height: '22px' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: notifications[key] ? 'translateX(18px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
              <Separator className="bg-white/5 last:hidden" />
            </div>
          ))}
          <div className="pt-3 flex items-center gap-3">
            <Button size="sm" disabled={savingNotifs} onClick={saveNotifications} className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 gap-2">
              {savingNotifs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Preferences
            </Button>
            {notifSaved && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Regional */}
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-[hsl(var(--svc-cyber))]" />
            Regional Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option>UTC-5 (Eastern)</option>
                <option>UTC-6 (Central)</option>
                <option>UTC-8 (Pacific)</option>
                <option>UTC+0 (London)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Currency display</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option>USD — US Dollar</option>
                <option>GBP — British Pound</option>
                <option>EUR — Euro</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" disabled={savingNotifs} onClick={saveNotifications} className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 gap-2">
              {savingNotifs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Regional
            </Button>
            {notifSaved && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-xs text-yellow-300">
        Changes to contact information require email verification before taking effect. Compliance notifications cannot be fully disabled.
      </div>
    </div>
  )
}
