import { useState } from "react";
import { Globe, MessageSquare, CheckCircle2, Clock, Users, ArrowLeft, ArrowRight, BarChart2, AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const syncStats = [
  { label: "Subscribers Synced", value: "4,821", delta: "Updated 4 min ago", icon: Users, accent: "text-[hsl(38_90%_58%)]", bg: "bg-[hsl(38_90%_55%/0.1)]", border: "border-[hsl(38_90%_55%/0.2)]" },
  { label: "Campaigns Sent", value: "12", delta: "This month", icon: MessageSquare, accent: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { label: "Open Rate", value: "34.2%", delta: "+2.1% vs last month", icon: BarChart2, accent: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { label: "Bounces", value: "7", delta: "Last campaign", icon: AlertTriangle, accent: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
];

const recentActivity = [
  { event: "Audience sync completed", detail: "4,821 contacts updated", time: "4 min ago", ok: true },
  { event: "Campaign dispatched", detail: "Security Digest — Week 12", time: "2 days ago", ok: true },
  { event: "Webhook received", detail: "Unsubscribe event — 1 contact", time: "3 days ago", ok: true },
  { event: "Sync warning", detail: "3 contacts rejected — invalid email format", time: "5 days ago", ok: false },
  { event: "Campaign dispatched", detail: "Critical Incident Notification", time: "6 days ago", ok: true },
];

const triggers = [
  { id: "TRG-001", name: "Critical Incident Alert", audience: "Security Team", enabled: true },
  { id: "TRG-002", name: "Weekly Security Digest", audience: "All Subscribers", enabled: true },
  { id: "TRG-003", name: "KYC Approval Welcome", audience: "New Members", enabled: true },
  { id: "TRG-004", name: "Overdue Task Reminder", audience: "Analysts", enabled: false },
];

export default function GlobalGatewayMailchimp() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••••••••mc_key");
  const [audienceId, setAudienceId] = useState("a1b2c3d4e5");
  const [webhookUrl, setWebhookUrl] = useState("https://gem-enterprise.vercel.app/api/webhooks/mailchimp");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [triggerStates, setTriggerStates] = useState<Record<string, boolean>>(
    Object.fromEntries(triggers.map((t) => [t.id, t.enabled]))
  );

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast({ title: "Mailchimp settings saved" });
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSyncing(false);
    toast({ title: "Sync triggered", description: "Audience sync started. This may take a few minutes." });
  };

  const toggleTrigger = (id: string) => {
    setTriggerStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <Link to="/global-gateway" className="hover:text-primary transition-colors">Global Gateway</Link>
            <ArrowRight className="w-3 h-3" />
            <Link to="/global-gateway/connect" className="hover:text-primary transition-colors">Connections</Link>
            <ArrowRight className="w-3 h-3" />
            <span className="text-foreground">Mailchimp</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              GEM Fortress Portal
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                Mailchimp
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border bg-success/10 text-success border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Connected
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your Mailchimp integration — credentials, audience sync, and campaign triggers.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="shrink-0 gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync Now"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {syncStats.map((s) => (
            <div key={s.label} className={`glass-panel rounded-xl p-4 border ${s.border}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Credentials */}
          <section className="glass-panel rounded-xl border border-border/50 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/40">
              <MessageSquare className="w-4 h-4 text-[hsl(38_90%_58%)]" />
              <h2 className="text-sm font-semibold text-foreground">Connection Settings</h2>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-api-key" className="text-xs">API Key</Label>
              <Input
                id="mc-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">Mailchimp API key from Account → Extras → API keys.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-audience-id" className="text-xs">Audience / List ID</Label>
              <Input
                id="mc-audience-id"
                value={audienceId}
                onChange={(e) => setAudienceId(e.target.value)}
                className="text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">Found under Audience → Settings → Audience name and defaults.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-webhook" className="text-xs">Webhook Receive URL</Label>
              <Input
                id="mc-webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="text-sm font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Register this URL in Mailchimp → Audience → Manage → Webhooks.</p>
            </div>

            <Button onClick={handleSave} disabled={saving} size="sm" className="w-fit">
              {saving ? "Saving…" : "Save Settings"}
            </Button>
          </section>

          {/* Campaign Triggers */}
          <section className="glass-panel rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/40 mb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Campaign Triggers</h2>
            </div>
            <div className="divide-y divide-border/30">
              {triggers.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Audience: {t.audience}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTrigger(t.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${triggerStates[t.id] ? "bg-primary" : "bg-secondary"}`}
                    aria-pressed={triggerStates[t.id]}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-background shadow transform transition-transform duration-200 ${triggerStates[t.id] ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {recentActivity.map((a, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {a.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.event}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <Link
          to="/global-gateway"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Global Gateway
        </Link>
      </div>
    </PortalLayout>
  );
}
