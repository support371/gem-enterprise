import { useState } from "react";
import { User, Mail, Shield, Camera, Save, KeyRound } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const roleLabel: Record<string, string> = {
  admin:   "Administrator",
  manager: "Manager",
  analyst: "Analyst",
  viewer:  "Viewer",
};

const roleBadgeColor: Record<string, string> = {
  admin:   "bg-destructive/10 text-destructive border-destructive/20",
  manager: "bg-primary/10 text-primary border-primary/20",
  analyst: "bg-success/10 text-success border-success/20",
  viewer:  "bg-muted text-muted-foreground border-border",
};

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl: string = (user?.user_metadata?.avatar_url as string) || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await updatePassword(newPassword);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              GEM Fortress Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your account information and security credentials.
          </p>
        </div>

        {/* Identity Card */}
        <div className="glass-panel rounded-xl border border-border/50 p-6 relative gradient-top-border">
          <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Identity
          </h2>

          {/* Avatar + info row */}
          <div className="flex items-center gap-5 mb-6 p-4 rounded-xl bg-sidebar-accent/30 border border-sidebar-border/50">
            <div className="relative shrink-0">
              <Avatar className="w-16 h-16 ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-[0_0_16px_hsl(var(--electric-cyan)/0.2)]">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center cursor-not-allowed">
                <Camera className="w-3 h-3 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              {role && (
                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleBadgeColor[role] || "bg-primary/10 text-primary border-primary/20"}`}>
                  {roleLabel[role] || role}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label className="text-xs text-muted-foreground font-medium">Display name</Label>
              <Input
                value={displayName}
                readOnly
                className="mt-1.5 bg-sidebar-accent/20 cursor-not-allowed text-foreground/70 border-sidebar-border"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-medium">Email address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  value={user?.email || ""}
                  readOnly
                  className="pl-9 bg-sidebar-accent/20 cursor-not-allowed text-foreground/70 border-sidebar-border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="glass-panel rounded-xl border border-border/50 p-6">
          <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="grid gap-4">
            <div>
              <Label htmlFor="new-password" className="text-xs text-muted-foreground font-medium">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-xs text-muted-foreground font-medium">
                Confirm new password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !newPassword || !confirmPassword}
              className="w-fit"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </div>

        {/* Account Details */}
        <div className="glass-panel rounded-xl border border-border/50 p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Account Details</h2>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <dt className="text-sm text-muted-foreground">User ID</dt>
              <dd className="font-mono text-xs text-foreground/60 truncate max-w-[220px] bg-sidebar-accent/30 px-2 py-1 rounded border border-sidebar-border">
                {user?.id}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <dt className="text-sm text-muted-foreground">Account created</dt>
              <dd className="text-sm text-foreground/70 font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-sm text-muted-foreground">Last sign in</dt>
              <dd className="text-sm text-foreground/70 font-medium">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </PortalLayout>
  );
}
