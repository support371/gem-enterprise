import { useState } from "react";
import { Settings, Building2, Shield, Bell, CheckCircle2, Upload } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
  description: string;
}

function SettingToggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
          enabled ? "bg-primary" : "bg-secondary"
        )}
        aria-pressed={enabled}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-background shadow transform transition-transform duration-200",
            enabled ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

export default function PortalSettings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const avatarUrl: string = (user?.user_metadata?.avatar_url as string) || "";
  const displayName: string =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Organization
  const [orgName, setOrgName] = useState("GEM Enterprise Security");
  const [timezone, setTimezone] = useState("America/New_York");
  const [contactEmail, setContactEmail] = useState("security@gem.io");

  // Security
  const [requireMfa, setRequireMfa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [auditLog, setAuditLog] = useState(true);

  // Notifications
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [taskReminders, setTaskReminders] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Portal Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage organization, security policies, and notification preferences.
          </p>
        </div>

        {/* Profile */}
        <section className="glass-panel rounded-xl border border-border/50 p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40 mb-5">
            <Settings className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar className="w-20 h-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Upload className="w-5 h-5 text-foreground" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Profile photo is synced from your login provider.
              </p>
            </div>
          </div>
        </section>

        {/* Organization */}
        <section className="glass-panel rounded-xl border border-border/50 p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Organization</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-xs">Organization Name</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail" className="text-xs">Security Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="text-sm"
            />
          </div>
        </section>

        {/* Security */}
        <section className="glass-panel rounded-xl border border-border/50 p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Security Policies</h2>
          </div>
          <div className="divide-y divide-border/30">
            <SettingToggle
              enabled={requireMfa}
              onChange={() => setRequireMfa(!requireMfa)}
              label="Require MFA for all members"
              description="Members without MFA configured will be locked out on next login."
            />
            <SettingToggle
              enabled={sessionTimeout}
              onChange={() => setSessionTimeout(!sessionTimeout)}
              label="Auto session timeout (30 min)"
              description="Inactive portal sessions are terminated after 30 minutes."
            />
            <SettingToggle
              enabled={ipAllowlist}
              onChange={() => setIpAllowlist(!ipAllowlist)}
              label="IP allowlist enforcement"
              description="Restrict portal access to approved IP ranges only."
            />
            <SettingToggle
              enabled={auditLog}
              onChange={() => setAuditLog(!auditLog)}
              label="Extended audit logging"
              description="Log all read-access events in addition to write operations."
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-panel rounded-xl border border-border/50 p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40 mb-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="divide-y divide-border/30">
            <SettingToggle
              enabled={criticalAlerts}
              onChange={() => setCriticalAlerts(!criticalAlerts)}
              label="Critical incident alerts"
              description="Immediate email notification for Critical and High severity incidents."
            />
            <SettingToggle
              enabled={weeklyDigest}
              onChange={() => setWeeklyDigest(!weeklyDigest)}
              label="Weekly security digest"
              description="Summary of incidents, tasks, and metrics delivered every Monday."
            />
            <SettingToggle
              enabled={taskReminders}
              onChange={() => setTaskReminders(!taskReminders)}
              label="Overdue task reminders"
              description="Daily reminder for tasks past their due date."
            />
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved
            </div>
          )}
          <Button variant="hero" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
}
