import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  BookOpen, 
  FileText, 
  ArrowRight, 
  LogOut,
  User,
  Lock,
  Eye,
  Zap
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

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
