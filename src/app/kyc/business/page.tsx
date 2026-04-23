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

// ─── Schemas ────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  yearIncorporated: z
    .string()
    .min(4, "Year incorporated is required")
    .regex(/^\d{4}$/, "Must be a valid 4-digit year"),
  businessType: z.string().min(1, "Business type is required"),
});

const step2Schema = z.object({
  primaryContactName: z.string().min(1, "Primary contact name is required"),
  primaryContactEmail: z.string().email("Must be a valid email address"),
  ownershipPercentage: z
    .string()
    .min(1, "Ownership percentage is required")
    .refine((v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n >= 0 && n <= 100;
    }, "Must be between 0 and 100"),
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
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-sm text-muted-foreground sm:w-52 shrink-0">{label}</span>
      <span className="text-sm text-foreground font-medium mt-0.5 sm:mt-0">{value || "—"}</span>
    </div>
  );
}

export default function KYCBusinessPage() {
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
        body: JSON.stringify({ entityType: "business", ...step1Data, ...step2Data }),
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

      <h1 className="text-2xl font-bold text-foreground mb-2">Business Entity Verification</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Complete all steps to verify your corporation or LLC for platform access.
      </p>

      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(handleStep1Submit)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Business Information</h2>

            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...form1.register("companyName")} placeholder="Acme Holdings LLC" />
              {form1.formState.errors.companyName && <p className="text-xs text-destructive">{form1.formState.errors.companyName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input id="registrationNumber" {...form1.register("registrationNumber")} placeholder="e.g. EIN or company number" />
              {form1.formState.errors.registrationNumber && <p className="text-xs text-destructive">{form1.formState.errors.registrationNumber.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input id="jurisdiction" {...form1.register("jurisdiction")} placeholder="e.g. Delaware, United States" />
              {form1.formState.errors.jurisdiction && <p className="text-xs text-destructive">{form1.formState.errors.jurisdiction.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="yearIncorporated">Year Incorporated</Label>
              <Input id="yearIncorporated" {...form1.register("yearIncorporated")} placeholder="e.g. 2010" maxLength={4} />
              {form1.formState.errors.yearIncorporated && <p className="text-xs text-destructive">{form1.formState.errors.yearIncorporated.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="businessType">Business Type</Label>
              <select
                id="businessType"
                {...form1.register("businessType")}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))]"
              >
                <option value="">Select type</option>
                <option value="llc">Limited Liability Company (LLC)</option>
                <option value="corporation">Corporation (C-Corp / S-Corp)</option>
                <option value="partnership">Partnership / LP</option>
                <option value="sole-proprietorship">Sole Proprietorship</option>
                <option value="other">Other</option>
              </select>
              {form1.formState.errors.businessType && <p className="text-xs text-destructive">{form1.formState.errors.businessType.message}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
              Next: Beneficial Owners
            </Button>
          </div>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(handleStep2Submit)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Beneficial Owners</h2>
            <p className="text-sm text-muted-foreground">
              Provide information for the primary beneficial owner (UBO). Additional UBO documentation
              will be required in the document upload step.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="primaryContactName">Primary Contact Name</Label>
              <Input id="primaryContactName" {...form2.register("primaryContactName")} placeholder="Full legal name" />
              {form2.formState.errors.primaryContactName && <p className="text-xs text-destructive">{form2.formState.errors.primaryContactName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
              <Input id="primaryContactEmail" type="email" {...form2.register("primaryContactEmail")} placeholder="contact@company.com" />
              {form2.formState.errors.primaryContactEmail && <p className="text-xs text-destructive">{form2.formState.errors.primaryContactEmail.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ownershipPercentage">Ownership Percentage (%)</Label>
              <Input id="ownershipPercentage" type="number" min="0" max="100" step="0.01" {...form2.register("ownershipPercentage")} placeholder="e.g. 51" />
              {form2.formState.errors.ownershipPercentage && <p className="text-xs text-destructive">{form2.formState.errors.ownershipPercentage.message}</p>}
            </div>

            <div className="rounded-lg border border-[hsl(var(--electric-cyan)/0.3)] bg-[hsl(var(--electric-cyan)/0.05)] p-4 text-sm text-muted-foreground">
              <strong className="text-foreground block mb-1">UBO Documentation Note</strong>
              All Ultimate Beneficial Owners holding 25% or more of the entity must be individually
              verified. You will be asked to upload supporting documentation in the next stage.
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

      {/* Step 3 — Review */}
      {step === 3 && step1Data && step2Data && (
        <div>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))]">
            <h2 className="font-semibold text-foreground text-lg mb-4">Review Your Information</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Verify the information below before submitting your business application.
            </p>

            <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))] mb-1">Business Information</p>
            <ReviewRow label="Company Name" value={step1Data.companyName} />
            <ReviewRow label="Registration Number" value={step1Data.registrationNumber} />
            <ReviewRow label="Jurisdiction" value={step1Data.jurisdiction} />
            <ReviewRow label="Year Incorporated" value={step1Data.yearIncorporated} />
            <ReviewRow label="Business Type" value={step1Data.businessType} />

            <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))] mt-6 mb-1">Beneficial Owner</p>
            <ReviewRow label="Primary Contact Name" value={step2Data.primaryContactName} />
            <ReviewRow label="Primary Contact Email" value={step2Data.primaryContactEmail} />
            <ReviewRow label="Ownership Percentage" value={`${step2Data.ownershipPercentage}%`} />
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
