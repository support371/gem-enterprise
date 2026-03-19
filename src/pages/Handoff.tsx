import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const features = [
  "Security incident tracking and response",
  "Vulnerability management dashboard",
  "Team collaboration and audit logs",
  "Real-time threat monitoring",
];

export default function Handoff() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "there";

  // Auto-redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate("/portal/dashboard"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome, {displayName}!
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your account has been verified and activated. You now have access to the GEM
          Fortress portal.
        </p>

        {/* Feature List */}
        <div className="glass-panel rounded-xl border border-border/50 p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">What's available to you</span>
          </div>
          <ul className="space-y-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link to="/portal/dashboard">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Redirecting automatically in a few seconds…
        </p>

        {/* Progress */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-1.5 w-8 rounded-full bg-primary/30" />
          <div className="h-1.5 w-8 rounded-full bg-primary/30" />
          <div className="h-1.5 w-8 rounded-full bg-primary/30" />
          <div className="h-1.5 w-8 rounded-full bg-primary" />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Step 4 of 4 — Access Granted</p>
      </div>
    </div>
  );
}
