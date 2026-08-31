"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";

const organizationTypes = [
  { value: "company", label: "Company" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "government", label: "Government / Public Sector" },
  { value: "family_office", label: "Family Office" },
  { value: "professional_services", label: "Professional Services" },
  { value: "other", label: "Other" },
] as const;

const employeeRanges = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;

const concerns = [
  "Account access and identity",
  "Website or internet exposure",
  "Incident or suspicious activity",
  "Data handling and compliance",
  "Business operations and resilience",
  "AI and automation controls",
  "Not sure yet",
] as const;

const urgencyOptions = ["Immediate concern", "This week", "This month", "Planning ahead"] as const;

type SubmitResult = {
  ok?: boolean;
  reference?: string;
  message?: string;
  error?: string;
};

export function BusinessReviewIntakeForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const organization = String(form.get("organization") || "").trim();
    const title = String(form.get("title") || "").trim();
    const organizationType = String(form.get("organizationType") || "").trim();
    const employeeRange = String(form.get("employeeRange") || "").trim();
    const jurisdiction = String(form.get("jurisdiction") || "").trim();
    const primaryConcern = String(form.get("primaryConcern") || "").trim();
    const urgency = String(form.get("urgency") || "").trim();
    const summary = String(form.get("summary") || "").trim();
    const consentGiven = form.get("consentGiven") === "on";
    const privacyAccepted = form.get("privacyAccepted") === "on";
    const honeypot = String(form.get("honeypot") || "").trim();

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch("/api/intake/enterprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          email,
          organization,
          title,
          jurisdiction,
          organizationType,
          employeeRange,
          serviceAreas: ["cybersecurity", "advisory"],
          subject: `[Founding Business Review] ${primaryConcern}`,
          message: [
            `Offer: ${foundingBusinessReviewOffer.name}`,
            `Offer code: ${foundingBusinessReviewOffer.code}`,
            `Founding price: $${foundingBusinessReviewOffer.priceUsd}`,
            `Primary concern: ${primaryConcern}`,
            `Urgency: ${urgency}`,
            "",
            summary,
          ].join("\n"),
          consentGiven,
          privacyAccepted,
          honeypot,
          startedAt,
        }),
      });

      const result = (await response.json()) as SubmitResult;
      if (!response.ok) {
        throw new Error(result.error || result.message || "Unable to submit the review request.");
      }

      setReference(result.reference || "Submitted");
      event.currentTarget.reset();
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setError("The request timed out. Please submit it again.");
      } else {
        setError(caught instanceof Error ? caught.message : "Unable to submit the review request.");
      }
    } finally {
      window.clearTimeout(timeout);
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6" role="status">
        <CheckCircle2 className="h-7 w-7 text-emerald-400" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-semibold">Review request received</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          GEM will qualify the request before confirming the paid review scope or activating a client workspace.
        </p>
        <p className="mt-4 font-mono text-sm text-emerald-300">Reference: {reference}</p>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/15";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Your name
          <input className={inputClass} name="name" required minLength={2} maxLength={120} autoComplete="name" />
        </label>
        <label className="text-sm font-medium">
          Work email
          <input
            className={inputClass}
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
        </label>
        <label className="text-sm font-medium">
          Business or organization
          <input
            className={inputClass}
            name="organization"
            required
            minLength={2}
            maxLength={160}
            autoComplete="organization"
          />
        </label>
        <label className="text-sm font-medium">
          Your role or title
          <input
            className={inputClass}
            name="title"
            required
            minLength={2}
            maxLength={120}
            autoComplete="organization-title"
          />
        </label>
        <label className="text-sm font-medium">
          Operating jurisdiction
          <input
            className={inputClass}
            name="jurisdiction"
            required
            minLength={2}
            maxLength={120}
            placeholder="e.g. United States / New Jersey"
          />
        </label>
        <label className="text-sm font-medium">
          Organization type
          <select className={inputClass} name="organizationType" required defaultValue="">
            <option value="" disabled>Select type</option>
            {organizationTypes.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Team size
          <select className={inputClass} name="employeeRange" defaultValue="">
            <option value="">Prefer not to say</option>
            {employeeRanges.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Main concern
          <select className={inputClass} name="primaryConcern" required defaultValue="">
            <option value="" disabled>Select the closest match</option>
            {concerns.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Urgency
          <select className={inputClass} name="urgency" required defaultValue="">
            <option value="" disabled>Select urgency</option>
            {urgencyOptions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium">
        What is happening or what would you like GEM to review?
        <textarea
          className={`${inputClass} min-h-32 resize-y`}
          name="summary"
          required
          minLength={40}
          maxLength={4000}
          placeholder="Describe the concern, the systems involved, and the outcome you want. Do not include credentials or sensitive financial or identity information."
        />
      </label>

      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4 text-sm leading-6">
          <input name="consentGiven" type="checkbox" required className="mt-1" />
          <span>I consent to GEM reviewing this request for qualification and contacting me about the requested business review.</span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4 text-sm leading-6">
          <input name="privacyAccepted" type="checkbox" required className="mt-1" />
          <span>I accept the applicable privacy terms for processing this request.</span>
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {submitting ? "Submitting…" : "Request founding review"}
      </button>

      <p className="text-xs leading-5 text-muted-foreground">
        Submitting this request does not automatically activate service, create a privileged account, or charge you. GEM confirms fit and scope first.
      </p>
    </form>
  );
}
