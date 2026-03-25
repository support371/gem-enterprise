import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  BookOpen,
  FileText,
  ArrowRight,
  LogOut,
  User,
  Lock,
  Eye,
  Zap,
  Mail,
  CheckCircle2,
  Loader2,
  Link2,
  Unlink,
} from "lucide-react";

type MailchimpStatus = {
  connected: boolean;
  connectedAt?: string;
  authUrl?: string;
};

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [mailchimp, setMailchimp] = useState<MailchimpStatus | null>(null);
  const [mcLoading, setMcLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const fetchMailchimpStatus = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("mailchimp-connect", {
      method: "GET",
    });
    if (!error && data) setMailchimp(data as MailchimpStatus);
  }, []);

  useEffect(() => {
    if (user) fetchMailchimpStatus();
  }, [user, fetchMailchimpStatus]);

  // Handle OAuth callback: Mailchimp redirects back with ?code=xxx
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || !user) return;

    setMcLoading(true);
    setSearchParams({}, { replace: true });

    supabase.functions
      .invoke("mailchimp-connect", { body: { code } })
      .then(({ error }) => {
        if (error) {
          toast({ variant: "destructive", title: "Mailchimp connection failed", description: error.message });
        } else {
          toast({ title: "Mailchimp connected!", description: "Your audience is now linked." });
          fetchMailchimpStatus();
        }
      })
      .finally(() => setMcLoading(false));
  }, [searchParams, user, setSearchParams, toast, fetchMailchimpStatus]);

  const handleMailchimpConnect = () => {
    if (mailchimp?.authUrl) window.location.href = mailchimp.authUrl;
  };

  const handleMailchimpDisconnect = async () => {
    setMcLoading(true);
    const { error } = await supabase.functions.invoke("mailchimp-connect", { method: "DELETE" });
    if (error) {
      toast({ variant: "destructive", title: "Failed to disconnect Mailchimp" });
    } else {
      toast({ title: "Mailchimp disconnected" });
      setMailchimp((prev) => (prev ? { ...prev, connected: false } : null));
    }
    setMcLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const quickLinks = [
    { icon: Shield, label: "Trust Center", href: "/trust-center", description: "Compliance & certifications" },
    { icon: BookOpen, label: "Solutions", href: "/solutions", description: "Security services" },
    { icon: FileText, label: "Resources", href: "/resources", description: "Guides & documentation" },
  ];

  const securityStatus = [
    { icon: Shield, label: "SOC 2 Type II", status: "Active" },
    { icon: Lock, label: "ISO 27001", status: "Compliant" },
    { icon: Eye, label: "Monitoring", status: "24/7" },
    { icon: Zap, label: "Response Time", status: "< 15 min" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Links */}
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">Quick Access</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {quickLinks.map(({ icon: Icon, label, href, description }) => (
                    <Link
                      key={label}
                      to={href}
                      className="group p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <Icon className="w-6 h-6 text-primary mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                      <ArrowRight className="w-4 h-4 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="glass-panel rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Ready for Enterprise-Grade Security?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Schedule a briefing with our security experts to discuss your organization's specific needs.
                </p>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/contact">
                    Request Enterprise Briefing
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Status */}
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Security Status</h2>
                <div className="space-y-3">
                  {securityStatus.map(({ icon: Icon, label, status }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">{label}</span>
                      </div>
                      <span className="text-xs font-medium text-success">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mailchimp Integration */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Mailchimp</h2>
                </div>

                {mailchimp === null ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking status…</span>
                  </div>
                ) : mailchimp.connected ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-success mb-4">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Connected</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Contact form submissions and newsletter signups are syncing to your Mailchimp audience.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground hover:text-destructive"
                      disabled={mcLoading}
                      onClick={handleMailchimpDisconnect}
                    >
                      {mcLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Unlink className="w-4 h-4 mr-2" />}
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-4">
                      Connect Mailchimp to sync contact form leads and newsletter signups to your audience.
                    </p>
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full"
                      disabled={mcLoading || !mailchimp.authUrl}
                      onClick={handleMailchimpConnect}
                    >
                      {mcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                      Connect Mailchimp
                    </Button>
                  </>
                )}
              </div>

              {/* Account Actions */}
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
