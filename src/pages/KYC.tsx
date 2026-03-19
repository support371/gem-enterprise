import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, Building2, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function KYC() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    jobTitle: "",
    phone: "",
    country: "",
    useCase: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = Object.values(form).every((v) => v.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    // In production: submit KYC data to backend/Supabase
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast({ title: "Verification submitted", description: "We're reviewing your information." });
    navigate("/kyc/status");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Identity Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We need a few details to verify your identity and organization.
          </p>
        </div>

        {/* Form */}
        <div className="glass-panel rounded-xl border border-border/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-xs text-muted-foreground">First name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="organization" className="text-xs text-muted-foreground">Organization</Label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="organization"
                  placeholder="Acme Corp"
                  value={form.organization}
                  onChange={(e) => update("organization", e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="jobTitle" className="text-xs text-muted-foreground">Job title</Label>
              <Input
                id="jobTitle"
                placeholder="Security Analyst"
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="text-xs text-muted-foreground">Country</Label>
              <Input
                id="country"
                placeholder="United States"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="useCase" className="text-xs text-muted-foreground">
                Primary use case
              </Label>
              <textarea
                id="useCase"
                rows={3}
                placeholder="Briefly describe how your organization will use GEM Fortress…"
                value={form.useCase}
                onChange={(e) => update("useCase", e.target.value)}
                required
                className="mt-1 w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !isValid}>
              {loading ? "Submitting…" : "Submit for Verification"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </div>

        {/* Progress */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="h-1.5 w-8 rounded-full bg-primary/30" />
          <div className="h-1.5 w-8 rounded-full bg-primary" />
          <div className="h-1.5 w-8 rounded-full bg-border" />
          <div className="h-1.5 w-8 rounded-full bg-border" />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">Step 2 of 4 — Verification</p>
      </div>
    </div>
  );
}
