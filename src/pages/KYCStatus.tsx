import { Link } from "react-router-dom";
import { Shield, Clock, CheckCircle2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  { label: "Account created", done: true },
  { label: "Information submitted", done: true },
  { label: "Under review", done: false, active: true },
  { label: "Access granted", done: false },
];

export default function KYCStatus() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Verification In Progress</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your application is being reviewed by our compliance team. This typically takes
          1–2 business days.
        </p>

        {/* Status Steps */}
        <div className="glass-panel rounded-xl border border-border/50 p-6 mb-6 text-left">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Application Status
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  step.done
                    ? "bg-success/10 border-success/30 text-success"
                    : step.active
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted border-border text-muted-foreground"
                }`}>
                  {step.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : step.active ? (
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  step.done
                    ? "text-foreground"
                    : step.active
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Email Notice */}
        <div className="flex items-start gap-3 text-left glass-panel rounded-xl border border-border/50 p-4 mb-6">
          <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            We'll send a confirmation to{" "}
            <span className="text-foreground font-medium">{user?.email || "your email"}</span>{" "}
            once your account has been approved.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Once approved, you'll receive an email with a link to access the portal.
          If you haven't heard back after 2 business days, please{" "}
          <Link to="/support" className="text-primary hover:underline">
            contact support
          </Link>
          .
        </p>

        {/* Progress */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-1.5 w-8 rounded-full bg-primary/30" />
          <div className="h-1.5 w-8 rounded-full bg-primary/30" />
          <div className="h-1.5 w-8 rounded-full bg-primary" />
          <div className="h-1.5 w-8 rounded-full bg-border" />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Step 3 of 4 — Review</p>
      </div>
    </div>
  );
}
