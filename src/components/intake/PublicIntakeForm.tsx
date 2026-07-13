"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

type IntakeFormProps =
  | { kind: "ENTERPRISE" }
  | { kind: "COMMUNITY" }
  | {
      kind: "PRODUCT_REQUEST";
      product: { slug: string; name: string; sku?: string; category?: string };
    };

const enterpriseServices = [
  ["cybersecurity", "Cybersecurity"],
  ["compliance", "Compliance readiness"],
  ["financial_risk", "Financial-risk support"],
  ["real_estate", "Real-estate risk"],
  ["advisory", "Advisory"],
] as const;

const communityInterests = [
  ["capital_deployment", "Capital deployment"],
  ["operator_introductions", "Operator introductions"],
  ["real_estate", "Real estate"],
  ["security_compliance", "Security and compliance"],
  ["legal_regulatory", "Legal and regulatory"],
  ["family_office_coordination", "Family-office coordination"],
  ["deal_flow", "Deal flow"],
] as const;

function endpointFor(kind: IntakeFormProps["kind"]): string {
  if (kind === "ENTERPRISE") return "/api/intake/enterprise";
  if (kind === "COMMUNITY") return "/api/intake/community";
  return "/api/intake/product";
}

export function PublicIntakeForm(props: IntakeFormProps) {
  const startedAt = useRef(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(value: string) {
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setError(null);

    const form = new FormData(formElement);
    const common = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? "") || undefined,
      organization: String(form.get("organization") ?? "") || undefined,
      title: String(form.get("title") ?? "") || undefined,
      jurisdiction: String(form.get("jurisdiction") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
      consentGiven: form.get("consentGiven") === "on",
      privacyAccepted: form.get("privacyAccepted") === "on",
      honeypot: String(form.get("website") ?? ""),
      startedAt: startedAt.current,
    };

    let payload: Record<string, unknown> = common;
    if (props.kind === "ENTERPRISE") {
      payload = {
        ...common,
        organization: String(form.get("organization") ?? ""),
        title: String(form.get("title") ?? ""),
        organizationType: String(form.get("organizationType") ?? ""),
        employeeRange: String(form.get("employeeRange") ?? "") || undefined,
        serviceAreas: selected,
      };
    } else if (props.kind === "COMMUNITY") {
      payload = {
        ...common,
        title: String(form.get("title") ?? ""),
        entityType: String(form.get("entityType") ?? ""),
        interests: selected,
        referral: String(form.get("referral") ?? "") || undefined,
      };
    } else {
      payload = {
        ...common,
        productSlug: props.product.slug,
        productName: props.product.name,
        productSku: props.product.sku,
        productCategory: props.product.category,
        quantity: Number(form.get("quantity") ?? 1),
        intendedUse: String(form.get("intendedUse") ?? ""),
        budgetRange: String(form.get("budgetRange") ?? "") || undefined,
      };
    }

    try {
      const response = await fetch(endpointFor(props.kind), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        reference?: string;
        error?: string;
        fields?: Record<string, string[]>;
      };

      if (!response.ok) {
        const fieldMessage = result.fields
          ? Object.values(result.fields).flat().filter(Boolean)[0]
          : undefined;
        throw new Error(fieldMessage || result.error || "The request could not be recorded.");
      }

      setReference(result.reference ?? "Recorded");
      formElement.reset();
      setSelected([]);
      startedAt.current = Date.now();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The request could not be recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold">Request recorded</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Keep this reference: <strong className="font-mono text-foreground">{reference}</strong>
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This confirms receipt for human review. It does not create an account, contract, approval,
          entitlement, price, or service commitment.
        </p>
      </div>
    );
  }

  const selectionOptions = props.kind === "ENTERPRISE" ? enterpriseServices : communityInterests;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Full name</span>
          <input name="name" required minLength={2} maxLength={120} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Email</span>
          <input name="email" type="email" required maxLength={254} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Phone, optional</span>
          <input name="phone" maxLength={64} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Jurisdiction</span>
          <input name="jurisdiction" required maxLength={120} placeholder="Country and state/region" className="w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Organization{props.kind === "ENTERPRISE" ? "" : ", optional"}</span>
          <input name="organization" required={props.kind === "ENTERPRISE"} maxLength={160} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Role or title{props.kind === "PRODUCT_REQUEST" ? ", optional" : ""}</span>
          <input name="title" required={props.kind !== "PRODUCT_REQUEST"} maxLength={120} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
        </label>
      </div>

      {props.kind === "ENTERPRISE" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Organization type</span>
            <select name="organizationType" required className="w-full rounded-xl border border-border bg-background px-4 py-3">
              <option value="">Select one</option>
              <option value="company">Company</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="government">Government</option>
              <option value="family_office">Family office</option>
              <option value="professional_services">Professional services</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Team size, optional</span>
            <select name="employeeRange" className="w-full rounded-xl border border-border bg-background px-4 py-3">
              <option value="">Not specified</option>
              <option value="1-10">1–10</option>
              <option value="11-50">11–50</option>
              <option value="51-200">51–200</option>
              <option value="201-1000">201–1,000</option>
              <option value="1000+">1,000+</option>
            </select>
          </label>
        </div>
      )}

      {props.kind === "COMMUNITY" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Applicant type</span>
            <select name="entityType" required className="w-full rounded-xl border border-border bg-background px-4 py-3">
              <option value="">Select one</option>
              <option value="operator">Operator</option>
              <option value="investor">Investor</option>
              <option value="advisor">Advisor</option>
              <option value="family_office">Family office</option>
              <option value="institution">Institution</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Referral, optional</span>
            <input name="referral" maxLength={200} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
          </label>
        </div>
      )}

      {props.kind !== "PRODUCT_REQUEST" && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            {props.kind === "ENTERPRISE" ? "Requested areas" : "Areas of interest"}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {selectionOptions.map(([value, label]) => (
              <label key={value} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 text-sm">
                <input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} />
                {label}
              </label>
            ))}
          </div>
          {selected.length === 0 && <p className="text-xs text-amber-300">Select at least one area.</p>}
        </fieldset>
      )}

      {props.kind === "PRODUCT_REQUEST" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Quantity</span>
            <input name="quantity" type="number" min={1} max={100} defaultValue={1} required className="w-full rounded-xl border border-border bg-background px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Indicative budget, optional</span>
            <select name="budgetRange" className="w-full rounded-xl border border-border bg-background px-4 py-3">
              <option value="">Not specified</option>
              <option value="under_1000">Under $1,000</option>
              <option value="1000_5000">$1,000–$5,000</option>
              <option value="5000_25000">$5,000–$25,000</option>
              <option value="25000_plus">$25,000+</option>
              <option value="not_sure">Not sure</option>
            </select>
          </label>
          <label className="space-y-2 text-sm sm:col-span-2">
            <span className="font-medium">Intended use</span>
            <textarea name="intendedUse" required minLength={20} maxLength={2000} rows={4} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
          </label>
        </div>
      )}

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Request summary</span>
        <input name="subject" required minLength={5} maxLength={200} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Details</span>
        <textarea name="message" required minLength={40} maxLength={5000} rows={7} className="w-full rounded-xl border border-border bg-background px-4 py-3" />
      </label>

      <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>Do not submit passwords, identity-document numbers, banking or card details, private keys, recovery codes, medical information, or confidential client records.</p>
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm leading-6">
        <input name="consentGiven" type="checkbox" required className="mt-1" />
        <span>I consent to GEM recording this information for qualification and human review.</span>
      </label>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input name="privacyAccepted" type="checkbox" required className="mt-1" />
        <span>I have read and accept the privacy notice and understand that submission does not guarantee acceptance or service activation.</span>
      </label>

      <label className="absolute left-[-9999px]" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}

      <button
        type="submit"
        disabled={submitting || (props.kind !== "PRODUCT_REQUEST" && selected.length === 0)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {submitting ? "Recording request" : "Submit for human review"}
      </button>
    </form>
  );
}
