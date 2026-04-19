"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const step1Schema = z.object({
  officeName: z.string().min(1, "Family office name is required"),
  aumRange: z.string().min(1, "AUM range is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  primaryContactName: z.string().min(1, "Primary contact name is required"),
  primaryContactEmail: z.string().email("Must be a valid email"),
  primaryContactTitle: z.string().min(1, "Contact title is required"),
});

const step2Schema = z.object({
  primaryStrategies: z.string().min(1, "Primary strategies are required"),
  assetClasses: z.string().min(1, "Asset classes are required"),
  investmentHorizon: z.string().min(1, "Investment horizon is required"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const TOTAL_STEPS = 3;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const s = i + 1;
        const done = s < current;
        const active = s === current;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                done
                  ? "bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))]"
                  : active
                  ? "border-2 border-[hsl(var(--electric-cyan))] text-[hsl(var(--electric-cyan))]"
                  : "border border-[hsl(var(--border))] text-muted-foreground"
              }`}
            >
              {done ? (
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                </svg>
              ) : s}
            </div>
            {s < total && (
              <div className={`h-px w-8 sm:w-12 transition-colors ${done ? "bg-[hsl(var(--electric-cyan))]" : "bg-[hsl(var(--border))]"}`} />
            )}
          </div>
        );
      })}
      <span className="ml-2 text-xs text-muted-foreground">Step {current} of {total}</span>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-sm text-muted-foreground sm:w-52 shrink-0">{label}</span>
      <span className="text-sm text-foreground font-medium mt-0.5 sm:mt-0">{value || "—"}</span>
    </div>
  );
}

export default function KYCFamilyOfficePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema), defaultValues: step1Data ?? {} });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: step2Data ?? {} });

  const handleStep1Submit = (data: Step1Data) => { setStep1Data(data); setStep(2); };
  const handleStep2Submit = (data: Step2Data) => { setStep2Data(data); setStep(3); };

  const handleFinalSubmit = async () => {
    if (!step1Data || !step2Data) return;
    setSubmitting(true);
    try {
      await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "family-office", ...step1Data, ...step2Data }),
      });
      router.push("/kyc/upload");
    } catch {
      router.push("/kyc/upload");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/kyc/start"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-2">Family Office Verification</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Complete all steps to verify your family office structure for platform access.
      </p>

      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(handleStep1Submit)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Family Office Information</h2>

            <div className="space-y-1.5">
              <Label htmlFor="officeName">Family Office Name</Label>
              <Input id="officeName" {...form1.register("officeName")} placeholder="e.g. Smith Family Office LP" />
              {form1.formState.errors.officeName && <p className="text-xs text-destructive">{form1.formState.errors.officeName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="aumRange">Assets Under Management (AUM)</Label>
              <select
                id="aumRange"
                {...form1.register("aumRange")}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))]"
              >
                <option value="">Select AUM range</option>
                <option value="10m-50m">$10M – $50M</option>
                <option value="50m-100m">$50M – $100M</option>
                <option value="100m-500m">$100M – $500M</option>
                <option value="500m-1b">$500M – $1B</option>
                <option value="1b+">$1B+</option>
              </select>
              {form1.formState.errors.aumRange && <p className="text-xs text-destructive">{form1.formState.errors.aumRange.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input id="jurisdiction" {...form1.register("jurisdiction")} placeholder="e.g. New York, United States" />
              {form1.formState.errors.jurisdiction && <p className="text-xs text-destructive">{form1.formState.errors.jurisdiction.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primaryContactName">Primary Contact Name</Label>
              <Input id="primaryContactName" {...form1.register("primaryContactName")} placeholder="Full legal name" />
              {form1.formState.errors.primaryContactName && <p className="text-xs text-destructive">{form1.formState.errors.primaryContactName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primaryContactTitle">Title / Role</Label>
              <Input id="primaryContactTitle" {...form1.register("primaryContactTitle")} placeholder="e.g. Managing Director, CIO" />
              {form1.formState.errors.primaryContactTitle && <p className="text-xs text-destructive">{form1.formState.errors.primaryContactTitle.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primaryContactEmail">Contact Email</Label>
              <Input id="primaryContactEmail" type="email" {...form1.register("primaryContactEmail")} placeholder="contact@familyoffice.com" />
              {form1.formState.errors.primaryContactEmail && <p className="text-xs text-destructive">{form1.formState.errors.primaryContactEmail.message}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
              Next: Investment Profile
            </Button>
          </div>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(handleStep2Submit)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Investment Profile</h2>

            <div className="space-y-1.5">
              <Label htmlFor="primaryStrategies">Primary Investment Strategies</Label>
              <Input id="primaryStrategies" {...form2.register("primaryStrategies")} placeholder="e.g. Long/short equity, private credit, direct lending" />
              {form2.formState.errors.primaryStrategies && <p className="text-xs text-destructive">{form2.formState.errors.primaryStrategies.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assetClasses">Asset Classes</Label>
              <Input id="assetClasses" {...form2.register("assetClasses")} placeholder="e.g. Equities, Fixed Income, Real Estate, Private Equity" />
              {form2.formState.errors.assetClasses && <p className="text-xs text-destructive">{form2.formState.errors.assetClasses.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="investmentHorizon">Investment Horizon</Label>
              <select
                id="investmentHorizon"
                {...form2.register("investmentHorizon")}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))]"
              >
                <option value="">Select horizon</option>
                <option value="short">Short-term (under 2 years)</option>
                <option value="medium">Medium-term (2–5 years)</option>
                <option value="long">Long-term (5–10 years)</option>
                <option value="very-long">Very long-term (10+ years)</option>
              </select>
              {form2.formState.errors.investmentHorizon && <p className="text-xs text-destructive">{form2.formState.errors.investmentHorizon.message}</p>}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button type="submit" className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
              Next: Review
            </Button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && step1Data && step2Data && (
        <div>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))]">
            <h2 className="font-semibold text-foreground text-lg mb-4">Review Your Information</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Verify the information below before submitting your family office application.
            </p>

            <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))] mb-1">Family Office Information</p>
            <ReviewRow label="Office Name" value={step1Data.officeName} />
            <ReviewRow label="AUM Range" value={step1Data.aumRange} />
            <ReviewRow label="Jurisdiction" value={step1Data.jurisdiction} />
            <ReviewRow label="Primary Contact" value={step1Data.primaryContactName} />
            <ReviewRow label="Title / Role" value={step1Data.primaryContactTitle} />
            <ReviewRow label="Contact Email" value={step1Data.primaryContactEmail} />

            <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))] mt-6 mb-1">Investment Profile</p>
            <ReviewRow label="Primary Strategies" value={step2Data.primaryStrategies} />
            <ReviewRow label="Asset Classes" value={step2Data.assetClasses} />
            <ReviewRow label="Investment Horizon" value={step2Data.investmentHorizon} />
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90"
            >
              {submitting ? "Saving…" : "Submit & Continue"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
