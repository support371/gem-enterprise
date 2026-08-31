"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { foundingBusinessReviewOffer } from "@/lib/market/launchOffer";

const organizationTypes = [
  "Corporation",
  "LLC",
  "Partnership",
  "Nonprofit",
  "Government/Public Sector",
  "Other",
] as const;

const employeeRanges = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"] as const;

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
  publicId?: string;
  message?: string;
  error?: string;
};

export function BusinessReviewIntakeForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const organization = String(form.get("organization") || "").trim();
    const organizationType = String(form.get("organizationType") || "").trim();
    const employeeRange = String(form.get("employeeRange") || "").trim();
    const operatingCountry = String(form.get("operatingCountry") || "").trim();
    const primaryConcern = String(form.get("primaryConcern") || "").trim();
    const urgency = String(form.get("urgency") || "").trim();
    const summary = String(form.get("summary") || "").trim();
    const privacyAccepted = form.get("privacyAccepted") === "on";
    const website = String(form.get("website") || "").trim();

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
          organizationType,
          employeeRange,
          serviceAreas: ["Cybersecurity", "Advisory"],
          operatingCountry,
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
          privacyAccepted,
          website,
        }),
      });

      const result = (await response.json()) as SubmitResult;
      if (!response.ok) {
        throw new Error(result.error || result.message || "Unable to submit the review request.");
      }

      setPublicId(result.publicId || "Submitted");
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

  if (publicId) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6" role="status">
        <CheckCircle2 className="h-7 w-7 text-emerald-400" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-semibold">Review request received</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          GEM will qualify the request before confirming the paid review scope or activating a client workspace.
        </p>
        <p className="mt-4 font-mono text-sm text-emerald-300">Reference: {publicId}</p>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/15";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Your name
          <input className={inputClass} name="name" required maxLength={120} autoComplete="name" />
        </label>
        <label className="text-sm font-medium">
          Work email
          <input
            className={inputClass}
            name="email"
            type="email"
            required
            maxLength={160}
            autoComplete="email"
          />
        </label>
        <label className="text-sm font-medium">
          Business or organization
          <input
            className={inputClass}
            name="organization"
            required
            maxLength={160}
            autoComplete="organization"
          />
        </label>
        <label className="text-sm font-medium">
          Operating country
          <input
            className={inputClass}
            name="operatingCountry"
            required
            maxLength={80}
            autoComplete="country-name"
          />
        </label>
        <label className="text-sm font-medium">
          Organization type
          <select className={inputClass} name="organizationType" required defaultValue="">
            <option value="" disabled>Select type</option>
            {organizationTypes.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Team size
          <select className={inputClass} name="employeeRange" required defaultValue="">
            <option value="" disabled>Select size</option>
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
        <label className="text-sm font-medium">
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
          minLength={20}
          maxLength={4000}
          placeholder="Describe the concern, the systems involved, and the outcome you want. Do not include passwords, API keys, or other credentials."
        />
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4 text-sm leading-6">
        <input name="privacyAccepted" type="checkbox" required className="mt-1" />
        <span>
          I agree that GEM may process this information to qualify and respond to this business review request.
        </span>
      </label>

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
