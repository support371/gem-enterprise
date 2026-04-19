"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
} from "lucide-react";

// ─── Schemas ──────────────────────────────────────────────────────────────

const s1 = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please provide a valid email"),
  phone: z.string().optional(),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
});

const s2 = z.object({
  entityType: z.enum(
    ["operator", "investor", "advisor", "family-office", "institution", "other"],
    { required_error: "Please select one" }
  ),
  organization: z.string().min(1, "Organization is required"),
  title: z.string().min(1, "Title / role is required"),
  linkedin: z.string().optional(),
  interests: z
    .array(z.string())
    .min(1, "Select at least one area of interest"),
});

const s3 = z.object({
  reason: z.string().min(40, "Please share at least a sentence or two (40+ characters)"),
  referral: z.string().optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to submit your application" }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the privacy policy" }),
  }),
});

type S1 = z.infer<typeof s1>;
type S2 = z.infer<typeof s2>;
type S3 = z.infer<typeof s3>;

// ─── Constants ────────────────────────────────────────────────────────────

const STEP_LABELS = ["About You", "Background", "Context & Consent"];

const INTEREST_OPTIONS = [
  "Capital Deployment",
  "Operator Introductions",
  "M&A / Exits",
  "Real Estate",
  "Security & Compliance",
  "Legal / Regulatory",
  "Family Office Coordination",
  "Deal Flow",
];

const SELECT_CLASS =
  "w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))]";

// ─── UI Bits ──────────────────────────────────────────────────────────────

function StepIndicator({
  current,
  total,
  labels,
}: {
  current: number;
  total: number;
  labels: string[];
}) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pb-2">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  done
                    ? "bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))]"
                    : active
                      ? "border-2 border-[hsl(var(--electric-cyan))] text-[hsl(var(--electric-cyan))]"
                      : "border border-[hsl(var(--border))] text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                  active ? "text-[hsl(var(--electric-cyan))]" : "text-muted-foreground"
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {step < total && (
              <div
                className={`h-px w-10 sm:w-20 mb-6 mx-1.5 transition-colors ${
                  done ? "bg-[hsl(var(--electric-cyan))]" : "bg-[hsl(var(--border))]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Main Form ────────────────────────────────────────────────────────────

export function RequestAccessForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    caseId: string;
    message: string;
  } | null>(null);

  const [d1, setD1] = useState<S1 | null>(null);
  const [d2, setD2] = useState<S2 | null>(null);

  const f1 = useForm<S1>({ resolver: zodResolver(s1), defaultValues: d1 ?? {} });
  const f2 = useForm<S2>({
    resolver: zodResolver(s2),
    defaultValues: d2 ?? { interests: [] },
  });
  const f3 = useForm<S3>({ resolver: zodResolver(s3) });

  const onS1 = (v: S1) => {
    setD1(v);
    setStep(2);
  };
  const onS2 = (v: S2) => {
    setD2(v);
    setStep(3);
  };

  const onFinal = async (v: S3) => {
    if (!d1 || !d2) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "general",
          serviceType: "hub_access_request",
          name: `${d1.firstName} ${d1.lastName}`,
          email: d1.email,
          phone: d1.phone,
          subject: `Community Hub Access Request — ${d2.entityType}`,
          message: [
            `Entity Type: ${d2.entityType}`,
            `Organization: ${d2.organization}`,
            `Title: ${d2.title}`,
            d2.linkedin ? `LinkedIn: ${d2.linkedin}` : null,
            `Interests: ${d2.interests.join(", ")}`,
            v.referral ? `Referral: ${v.referral}` : null,
            "",
            "Why they want access:",
            v.reason,
          ]
            .filter(Boolean)
            .join("\n"),
          urgency: "normal",
          jurisdiction: d1.jurisdiction,
          channelSource: "web_form",
          consentGiven: v.consentGiven,
          privacyAccepted: v.privacyAccepted,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(body?.error ?? "We could not submit your application. Please try again.");
        return;
      }

      setSuccess({
        caseId: body?.caseId ?? "GEM-APPLICATION",
        message:
          body?.message ??
          "Your application has been received. A member of the GEM team will be in touch within 10 business days.",
      });
    } catch {
      setServerError("Network error. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="glass-panel rounded-2xl border border-primary/30 p-8 md:p-12 text-center">
        <div className="p-3 rounded-full bg-primary/10 border border-primary/30 w-fit mx-auto mb-5">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Application Received
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-2">
          {success.message}
        </p>
        <p className="text-xs text-muted-foreground font-mono mb-8">
          Reference: {success.caseId}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/community-hub">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              Explore the Hub <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────
  return (
    <div>
      <StepIndicator current={step} total={STEP_LABELS.length} labels={STEP_LABELS} />

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={f1.handleSubmit(onS1)} noValidate>
          <div className="glass-panel rounded-xl p-6 md:p-8 border border-border/60 space-y-5">
            <div>
              <h2 className="font-semibold text-foreground text-lg">About You</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We use this to confirm identity and route your application to the right reviewer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...f1.register("firstName")} placeholder="Jane" />
                <FieldError message={f1.formState.errors.firstName?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...f1.register("lastName")} placeholder="Smith" />
                <FieldError message={f1.formState.errors.lastName?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...f1.register("email")}
                  placeholder="you@firm.com"
                />
                <FieldError message={f1.formState.errors.email?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...f1.register("phone")}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jurisdiction">Primary Jurisdiction</Label>
              <Input
                id="jurisdiction"
                {...f1.register("jurisdiction")}
                placeholder="e.g. United States, United Kingdom, Singapore"
              />
              <FieldError message={f1.formState.errors.jurisdiction?.message} />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="gap-2 glow-cyan">
              Next: Background <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={f2.handleSubmit(onS2)} noValidate>
          <div className="glass-panel rounded-xl p-6 md:p-8 border border-border/60 space-y-5">
            <div>
              <h2 className="font-semibold text-foreground text-lg">Background</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Help us understand your professional context.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="entityType">I am primarily a...</Label>
              <select
                id="entityType"
                {...f2.register("entityType")}
                className={SELECT_CLASS}
              >
                <option value="">Select one</option>
                <option value="operator">Operator / Founder / Executive</option>
                <option value="investor">Investor / Principal</option>
                <option value="advisor">Advisor / Specialist</option>
                <option value="family-office">Family Office Professional</option>
                <option value="institution">Institutional Representative</option>
                <option value="other">Other</option>
              </select>
              <FieldError message={f2.formState.errors.entityType?.message} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  {...f2.register("organization")}
                  placeholder="Firm / company name"
                />
                <FieldError message={f2.formState.errors.organization?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title / Role</Label>
                <Input id="title" {...f2.register("title")} placeholder="e.g. Managing Partner" />
                <FieldError message={f2.formState.errors.title?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedin">
                LinkedIn / Website <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="linkedin"
                {...f2.register("linkedin")}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label>Areas of Interest</Label>
              <p className="text-xs text-muted-foreground">
                Select any that apply. This shapes the introductions we prioritize.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 rounded-md border border-border/50 bg-muted/20 px-3 py-2 cursor-pointer hover:border-primary/40 hover:bg-muted/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={opt}
                      {...f2.register("interests")}
                      className="h-4 w-4 accent-[hsl(var(--electric-cyan))]"
                    />
                    <span className="text-sm text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
              <FieldError message={f2.formState.errors.interests?.message as string} />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button type="submit" className="gap-2 glow-cyan">
              Next: Context & Consent <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <form onSubmit={f3.handleSubmit(onFinal)} noValidate>
          <div className="glass-panel rounded-xl p-6 md:p-8 border border-border/60 space-y-5">
            <div>
              <h2 className="font-semibold text-foreground text-lg">Context & Consent</h2>
              <p className="text-sm text-muted-foreground mt-1">
                The more specific you are, the stronger your application.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">What brings you to the GEM Community?</Label>
              <Textarea
                id="reason"
                rows={6}
                {...f3.register("reason")}
                placeholder="Share what you are working on, who you want to meet, and what you bring to the room."
              />
              <FieldError message={f3.formState.errors.reason?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="referral">
                Referred by <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="referral"
                {...f3.register("referral")}
                placeholder="Name of a current member, or how you heard about us"
              />
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consentGiven"
                  onCheckedChange={(c) =>
                    f3.setValue("consentGiven", c === true ? true : (false as unknown as true), {
                      shouldValidate: true,
                    })
                  }
                />
                <label
                  htmlFor="consentGiven"
                  className="text-sm text-foreground leading-relaxed cursor-pointer"
                >
                  I consent to GEM Enterprise processing the information I have provided for the
                  purpose of reviewing my application.
                </label>
              </div>
              <FieldError message={f3.formState.errors.consentGiven?.message as string} />

              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacyAccepted"
                  onCheckedChange={(c) =>
                    f3.setValue(
                      "privacyAccepted",
                      c === true ? true : (false as unknown as true),
                      { shouldValidate: true }
                    )
                  }
                />
                <label
                  htmlFor="privacyAccepted"
                  className="text-sm text-foreground leading-relaxed cursor-pointer"
                >
                  I have read and accept the{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  .
                </label>
              </div>
              <FieldError message={f3.formState.errors.privacyAccepted?.message as string} />
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p>
                Your application is reviewed confidentially. Decisions are shared only with you.
              </p>
            </div>
          </div>

          {serverError && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2 glow-cyan">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  Submit Application <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
