'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Settings, Bell, Globe, Shield, Palette, Mail, Phone, Save } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email_alerts:   true,
    sms_alerts:     false,
    case_updates:   true,
    approvals:      true,
    compliance:     true,
    marketing:      false,
  })

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
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">First name</label>
              <Input defaultValue="Valued" className="bg-white/5 border-white/10 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Last name</label>
              <Input defaultValue="Client" className="bg-white/5 border-white/10 text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Email address</label>
            <Input defaultValue="client@example.com" type="email" className="bg-white/5 border-white/10 text-white text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Phone (optional)</label>
            <Input placeholder="+1 (555) 000-0000" type="tel" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm" />
          </div>
          <Button size="sm" className="bg-[hsl(var(--svc-cyber))] text-black hover:opacity-90 gap-2">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
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
          {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, val]) => {
            const labels: Record<keyof typeof notifications, string> = {
              email_alerts:  'Email alerts',
              sms_alerts:    'SMS alerts',
              case_updates:  'Case & request updates',
              approvals:     'Approval requests',
              compliance:    'Compliance reminders',
              marketing:     'Platform news & updates',
            }
            return (
              <div key={key}>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-300">{labels[key]}</span>
                  <button
                    onClick={() => toggle(key)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors ${val ? 'bg-[hsl(var(--svc-cyber))]' : 'bg-white/10'}`}
                    style={{ height: '22px' }}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${val ? 'translate-x-4.5' : 'translate-x-0'}`}
                      style={{ transform: val ? 'translateX(18px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
                <Separator className="bg-white/5 last:hidden" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Preferences */}
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
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option>UTC-5 (Eastern)</option>
                <option>UTC-6 (Central)</option>
                <option>UTC-8 (Pacific)</option>
                <option>UTC+0 (London)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Currency display</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option>USD — US Dollar</option>
                <option>GBP — British Pound</option>
                <option>EUR — Euro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-xs text-yellow-300">
        Changes to contact information require email verification before taking effect. Compliance notifications cannot be fully disabled.
      </div>
    </div>
  )
}
