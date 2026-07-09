"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  VERIFY_CONSENT_TEXT,
  VERIFY_PROHIBITED_DATA_NOTICE,
} from "@/lib/kyc/policy";

const formSchema = z.object({
  entityType: z.enum(["individual", "business", "trust", "family_office"]),
  legalName: z.string().trim().min(2, "Legal or operating name is required").max(120),
  country: z.string().trim().min(2, "Country is required").max(100),
  phone: z.string().trim().max(30).optional(),
  organizationName: z.string().trim().max(160).optional(),
  serviceInterest: z.string().trim().min(2, "Describe the service requested").max(240),
  accepted: z.boolean().refine((value) => value, "Consent is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function VerificationApplicationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityType: "individual",
      legalName: "",
      country: "",
      phone: "",
      organizationName: "",
      serviceInterest: "",
      accepted: false,
    },
  });

  async function readBody(response: Response) {
    return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setError(null);

    try {
      const applicationResponse = await fetch("/api/verify/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: data.entityType,
          legalName: data.legalName,
          country: data.country,
          phone: data.phone || undefined,
          organizationName: data.organizationName || undefined,
          serviceInterest: data.serviceInterest,
        }),
      });
      const applicationBody = await readBody(applicationResponse);
      if (!applicationResponse.ok) {
        if (applicationBody.code === "ACTIVE_VERIFICATION_APPLICATION_EXISTS") {
          router.push("/kyc/status");
          return;
        }
        throw new Error(String(applicationBody.error ?? "Application could not be saved."));
      }

      const application = applicationBody.application as { id?: string } | undefined;
      if (!application?.id) throw new Error("Application reference was not returned.");

      const consentResponse = await fetch("/api/verify/applications/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, accepted: true }),
      });
      const consentBody = await readBody(consentResponse);
      if (!consentResponse.ok) {
        throw new Error(String(consentBody.error ?? "Consent could not be recorded."));
      }

      const submitResponse = await fetch("/api/verify/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const submitBody = await readBody(submitResponse);
      if (!submitResponse.ok) {
        throw new Error(String(submitBody.error ?? "Application could not be submitted."));
      }

      router.push("/kyc/status");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Application could not be submitted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/kyc/start"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Review the process
      </Link>

      <h1 className="text-2xl font-bold text-foreground">Verification application</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Provide only the limited information needed to route and manually assess your request.
      </p>

      <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100/85">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p>{VERIFY_PROHIBITED_DATA_NOTICE}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5 rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="space-y-1.5">
          <Label htmlFor="entityType">Applicant type</Label>
          <select
            id="entityType"
            {...form.register("entityType")}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground"
          >
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="trust">Trust</option>
            <option value="family_office">Family office</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="legalName">Legal or operating name</Label>
          <Input id="legalName" {...form.register("legalName")} autoComplete="name" />
          <p className="text-xs text-destructive">{form.formState.errors.legalName?.message}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register("country")} autoComplete="country-name" />
            <p className="text-xs text-destructive">{form.formState.errors.country?.message}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" {...form.register("phone")} autoComplete="tel" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="organizationName">Organization name (optional)</Label>
          <Input id="organizationName" {...form.register("organizationName")} autoComplete="organization" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="serviceInterest">Service requested</Label>
          <textarea
            id="serviceInterest"
            {...form.register("serviceInterest")}
            rows={4}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground"
            placeholder="Describe the service or access you are requesting without including sensitive records."
          />
          <p className="text-xs text-destructive">{form.formState.errors.serviceInterest?.message}</p>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/10 p-4 text-sm text-muted-foreground">
          <input type="checkbox" {...form.register("accepted")} className="mt-1" />
          <span>{VERIFY_CONSENT_TEXT}</span>
        </label>
        <p className="text-xs text-destructive">{form.formState.errors.accepted?.message}</p>

        {error && (
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-400 font-semibold text-black hover:bg-cyan-300"
        >
          {submitting ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting</span>
          ) : (
            "Submit for manual review"
          )}
        </Button>
      </form>
    </div>
  );
}
