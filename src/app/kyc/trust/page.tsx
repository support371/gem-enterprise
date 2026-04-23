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
  trustName: z.string().min(1, "Trust name is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  trustType: z.string().min(1, "Trust type is required"),
  trusteeName: z.string().min(1, "Trustee name is required"),
});

const step2Schema = z.object({
  primaryBeneficiaryName: z.string().min(1, "Primary beneficiary name is required"),
  primaryBeneficiaryRelationship: z.string().min(1, "Relationship is required"),
  purposeOfTrust: z.string().min(10, "Please describe the purpose (minimum 10 characters)"),
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

export default function KYCTrustPage() {
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
        body: JSON.stringify({ entityType: "trust", ...step1Data, ...step2Data }),
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

      <h1 className="text-2xl font-bold text-foreground mb-2">Trust Entity Verification</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Complete all steps to verify your trust entity for platform access.
      </p>

      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(handleStep1Submit)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Trust Information</h2>

            <div className="space-y-1.5">
              <Label htmlFor="trustName">Trust Name</Label>
              <Input id="trustName" {...form1.register("trustName")} placeholder="e.g. The Smith Family Trust" />
              {form1.formState.errors.trustName && <p className="text-xs text-destructive">{form1.formState.errors.trustName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input id="jurisdiction" {...form1.register("jurisdiction")} placeholder="e.g. California, United States" />
              {form1.formState.errors.jurisdiction && <p className="text-xs text-destructive">{form1.formState.errors.jurisdiction.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trustType">Trust Type</Label>
              <select
                id="trustType"
                {...form1.register("trustType")}
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))]"
              >
                <option value="">Select trust type</option>
                <option value="revocable">Revocable Trust</option>
                <option value="irrevocable">Irrevocable Trust</option>
                <option value="discretionary">Discretionary Trust</option>
                <option value="other">Other</option>
              </select>
              {form1.formState.errors.trustType && <p className="text-xs text-destructive">{form1.formState.errors.trustType.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trusteeName">Trustee Name</Label>
              <Input id="trusteeName" {...form1.register("trusteeName")} placeholder="Full legal name of trustee" />
              {form1.formState.errors.trusteeName && <p className="text-xs text-destructive">{form1.formState.errors.trusteeName.message}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
              Next: Beneficiaries
            </Button>
          </div>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(handleStep2Submit)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Beneficiaries</h2>

            <div className="space-y-1.5">
              <Label htmlFor="primaryBeneficiaryName">Primary Beneficiary Name</Label>
              <Input id="primaryBeneficiaryName" {...form2.register("primaryBeneficiaryName")} placeholder="Full legal name" />
              {form2.formState.errors.primaryBeneficiaryName && <p className="text-xs text-destructive">{form2.formState.errors.primaryBeneficiaryName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primaryBeneficiaryRelationship">Relationship to Trustee</Label>
              <Input id="primaryBeneficiaryRelationship" {...form2.register("primaryBeneficiaryRelationship")} placeholder="e.g. Spouse, Child, Self" />
              {form2.formState.errors.primaryBeneficiaryRelationship && <p className="text-xs text-destructive">{form2.formState.errors.primaryBeneficiaryRelationship.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="purposeOfTrust">Purpose of Trust</Label>
              <textarea
                id="purposeOfTrust"
                {...form2.register("purposeOfTrust")}
                rows={4}
                placeholder="Describe the primary purpose of this trust (e.g. estate planning, asset protection, charitable giving)"
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))] resize-none"
              />
              {form2.formState.errors.purposeOfTrust && <p className="text-xs text-destructive">{form2.formState.errors.purposeOfTrust.message}</p>}
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
              Verify the information below before submitting your trust application.
            </p>

            <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))] mb-1">Trust Information</p>
            <ReviewRow label="Trust Name" value={step1Data.trustName} />
            <ReviewRow label="Jurisdiction" value={step1Data.jurisdiction} />
            <ReviewRow label="Trust Type" value={step1Data.trustType} />
            <ReviewRow label="Trustee Name" value={step1Data.trusteeName} />

            <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--electric-cyan))] mt-6 mb-1">Beneficiaries</p>
            <ReviewRow label="Primary Beneficiary" value={step2Data.primaryBeneficiaryName} />
            <ReviewRow label="Relationship" value={step2Data.primaryBeneficiaryRelationship} />
            <ReviewRow label="Purpose of Trust" value={step2Data.purposeOfTrust} />
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
