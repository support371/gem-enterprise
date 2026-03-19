import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const SAFE_RETURN_PREFIXES = ["/portal", "/profile", "/support", "/settings", "/kyc", "/handoff"];

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const SAFE_RETURN_PREFIXES = ["/portal", "/profile", "/support", "/settings", "/kyc"];

  useEffect(() => {
    if (user) {
      const from = location.state?.from;
      const dest =
        typeof from === "string" && SAFE_RETURN_PREFIXES.some((p) => from === p || from.startsWith(p + "/"))
          ? from
          : "/portal";
      navigate(dest, { replace: true });
    }
  }, [user, navigate, location.state]);

  const validateForm = (): boolean => {
    try {
      authSchema.parse({ email, password });
      
      if (isSignUp && password !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return false;
      }
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    setIsSubmitting(false);
    if (error) {
      toast({ variant: "destructive", title: "Reset failed", description: error.message });
    } else {
      setResetSent(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Account created",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: error.message.includes("Invalid login") 
              ? "Invalid email or password" 
              : error.message,
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="glass-panel rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">
              <span className="text-gradient-primary">GEM</span>
              <span className="text-foreground/80 ml-1">Cybersecurity</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            {isForgotPassword ? "Reset password" : isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {isForgotPassword 
              ? "We'll send you a link to reset your password"
              : isSignUp 
                ? "Join thousands of security professionals" 
                : "Sign in to access your dashboard"}
          </p>

          {isForgotPassword ? (
            resetSent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <p className="text-foreground font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">We sent a password reset link to <strong>{email}</strong></p>
                <button type="button" onClick={() => { setIsForgotPassword(false); setResetSent(false); }} className="text-primary hover:text-primary/80 font-medium text-sm">
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? "border-destructive" : ""} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : "Send reset link"}
                </Button>
                <div className="text-center">
                  <button type="button" onClick={() => { setIsForgotPassword(false); setErrors({}); }} className="text-primary hover:text-primary/80 font-medium text-sm">
                    Back to sign in
                  </button>
                </div>
              </form>
            )
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? "border-destructive" : ""} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <button type="button" onClick={() => { setIsForgotPassword(true); setErrors({}); }} className="text-xs text-primary hover:text-primary/80">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? "border-destructive" : ""} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={errors.confirmPassword ? "border-destructive" : ""} />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                )}

                <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{isSignUp ? "Creating account..." : "Signing in..."}</>
                  ) : (
                    isSignUp ? "Create account" : "Sign in"
                  )}
                </Button>
              </form>

              {/* Toggle */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }} className="text-primary hover:text-primary/80 font-medium">
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
