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
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

// ─── Schemas ────────────────────────────────────────────────────────────────

const section1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  taxResidency: z.string().min(1, "Tax residency is required"),
});

const section2Schema = z.object({
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Phone number is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / Province is required"),
  zip: z.string().min(1, "ZIP / Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const section3Schema = z.object({
  employmentStatus: z.string().min(1, "Employment status is required"),
  sourceOfFunds: z.string().min(1, "Source of funds is required"),
  annualIncomeRange: z.string().min(1, "Annual income range is required"),
  netWorthRange: z.string().min(1, "Net worth range is required"),
});

const section4Schema = z.object({
  isAccreditedInvestor: z.enum(["yes", "no"], {
    required_error: "Please indicate accredited investor status",
  }),
  investmentObjective: z.string().min(1, "Investment objective is required"),
});

type S1 = z.infer<typeof section1Schema>;
type S2 = z.infer<typeof section2Schema>;
type S3 = z.infer<typeof section3Schema>;
type S4 = z.infer<typeof section4Schema>;

const SECTION_LABELS = [
  "Personal Info",
  "Contact",
  "Financial Profile",
  "Accreditation",
];

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
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
                className={`mt-1 text-[10px] font-medium whitespace-nowrap ${
                  active ? "text-[hsl(var(--electric-cyan))]" : "text-muted-foreground"
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {step < total && (
              <div
                className={`h-px w-8 sm:w-16 mb-4 mx-1 transition-colors ${
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

const SELECT_CLASS =
  "w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--electric-cyan))]";

export default function KYCIndividualPage() {
  const router = useRouter();
  const [section, setSection] = useState(1);
  const [s1, setS1] = useState<S1 | null>(null);
  const [s2, setS2] = useState<S2 | null>(null);
  const [s3, setS3] = useState<S3 | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form1 = useForm<S1>({ resolver: zodResolver(section1Schema), defaultValues: s1 ?? {} });
  const form2 = useForm<S2>({ resolver: zodResolver(section2Schema), defaultValues: s2 ?? {} });
  const form3 = useForm<S3>({ resolver: zodResolver(section3Schema), defaultValues: s3 ?? {} });
  const form4 = useForm<S4>({ resolver: zodResolver(section4Schema) });

  const handleSection1 = (data: S1) => { setS1(data); setSection(2); };
  const handleSection2 = (data: S2) => { setS2(data); setSection(3); };
  const handleSection3 = (data: S3) => { setS3(data); setSection(4); };

  const handleFinalSubmit = async (data: S4) => {
    if (!s1 || !s2 || !s3) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "individual",
          ...s1, ...s2, ...s3, ...data,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Submission failed. Please try again.");
        return;
      }
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
        <ArrowLeft className="h-4 w-4" />
        Back to Entity Selection
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">Individual Verification</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Section {section} of {SECTION_LABELS.length} — {SECTION_LABELS[section - 1]}
      </p>

      <StepIndicator current={section} total={4} labels={SECTION_LABELS} />

      {/* ── Section 1: Personal Info ── */}
      {section === 1 && (
        <form onSubmit={form1.handleSubmit(handleSection1)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Personal Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...form1.register("firstName")} placeholder="Jane" />
                <FieldError message={form1.formState.errors.firstName?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...form1.register("lastName")} placeholder="Smith" />
                <FieldError message={form1.formState.errors.lastName?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...form1.register("dateOfBirth")} />
              <FieldError message={form1.formState.errors.dateOfBirth?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" {...form1.register("nationality")} placeholder="e.g. United States" />
              <FieldError message={form1.formState.errors.nationality?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="taxResidency">Tax Residency</Label>
              <Input id="taxResidency" {...form1.register("taxResidency")} placeholder="e.g. United States" />
              <p className="text-xs text-muted-foreground">Country where you are a tax resident.</p>
              <FieldError message={form1.formState.errors.taxResidency?.message} />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
              <span className="flex items-center gap-2">Next: Contact <ArrowRight className="h-4 w-4" /></span>
            </Button>
          </div>
        </form>
      )}

      {/* ── Section 2: Contact ── */}
      {section === 2 && (
        <form onSubmit={form2.handleSubmit(handleSection2)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Contact Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form2.register("email")} placeholder="you@example.com" />
                <FieldError message={form2.formState.errors.email?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" {...form2.register("phone")} placeholder="+1 (555) 000-0000" />
                <FieldError message={form2.formState.errors.phone?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input id="streetAddress" {...form2.register("streetAddress")} placeholder="123 Main Street, Apt 4B" />
              <FieldError message={form2.formState.errors.streetAddress?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form2.register("city")} placeholder="New York" />
                <FieldError message={form2.formState.errors.city?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" {...form2.register("state")} placeholder="NY" />
                <FieldError message={form2.formState.errors.state?.message} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input id="zip" {...form2.register("zip")} placeholder="10001" />
                <FieldError message={form2.formState.errors.zip?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...form2.register("country")} placeholder="United States" />
                <FieldError message={form2.formState.errors.country?.message} />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setSection(1)}>
              <span className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back</span>
            </Button>
            <Button type="submit" className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
              <span className="flex items-center gap-2">Next: Financial Profile <ArrowRight className="h-4 w-4" /></span>
            </Button>
          </div>
        </form>
      )}

      {/* ── Section 3: Financial Profile ── */}
      {section === 3 && (
        <form onSubmit={form3.handleSubmit(handleSection3)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-5">
            <h2 className="font-semibold text-foreground text-lg">Financial Profile</h2>

            <div className="space-y-1.5">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <select id="employmentStatus" {...form3.register("employmentStatus")} className={SELECT_CLASS}>
                <option value="">Select status</option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-Employed / Business Owner</option>
                <option value="retired">Retired</option>
                <option value="investor">Full-Time Investor</option>
                <option value="other">Other</option>
              </select>
              <FieldError message={form3.formState.errors.employmentStatus?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sourceOfFunds">Source of Funds</Label>
              <select id="sourceOfFunds" {...form3.register("sourceOfFunds")} className={SELECT_CLASS}>
                <option value="">Select source</option>
                <option value="employment">Employment / Salary</option>
                <option value="business">Business Income</option>
                <option value="investments">Investment Returns</option>
                <option value="inheritance">Inheritance / Gift</option>
                <option value="real-estate">Real Estate Proceeds</option>
                <option value="other">Other</option>
              </select>
              <FieldError message={form3.formState.errors.sourceOfFunds?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="annualIncomeRange">Annual Income Range</Label>
              <select id="annualIncomeRange" {...form3.register("annualIncomeRange")} className={SELECT_CLASS}>
                <option value="">Select range</option>
                <option value="under-200k">Under $200K</option>
                <option value="200k-500k">$200K – $500K</option>
                <option value="500k-1m">$500K – $1M</option>
                <option value="1m-5m">$1M – $5M</option>
                <option value="5m+">$5M+</option>
              </select>
              <FieldError message={form3.formState.errors.annualIncomeRange?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="netWorthRange">Net Worth Range</Label>
              <select id="netWorthRange" {...form3.register("netWorthRange")} className={SELECT_CLASS}>
                <option value="">Select range</option>
                <option value="under-1m">Under $1M</option>
                <option value="1m-5m">$1M – $5M</option>
                <option value="5m-10m">$5M – $10M</option>
                <option value="10m-25m">$10M – $25M</option>
                <option value="25m-50m">$25M – $50M</option>
                <option value="50m+">$50M+</option>
              </select>
              <FieldError message={form3.formState.errors.netWorthRange?.message} />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setSection(2)}>
              <span className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back</span>
            </Button>
            <Button type="submit" className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
              <span className="flex items-center gap-2">Next: Accreditation <ArrowRight className="h-4 w-4" /></span>
            </Button>
          </div>
        </form>
      )}

      {/* ── Section 4: Accreditation ── */}
      {section === 4 && (
        <form onSubmit={form4.handleSubmit(handleFinalSubmit)} noValidate>
          <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] space-y-6">
            <h2 className="font-semibold text-foreground text-lg">Accreditation Status</h2>

            <div className="space-y-3">
              <Label>Are you an accredited investor?</Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An accredited investor generally has an annual income exceeding $200K (individually)
                or $300K (joint) for the past two years, or a net worth exceeding $1M excluding
                primary residence.
              </p>
              <div className="flex flex-col gap-2 mt-2">
                {(["yes", "no"] as const).map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      value={val}
                      {...form4.register("isAccreditedInvestor")}
                      className="h-4 w-4 accent-[hsl(var(--electric-cyan))]"
                    />
                    <span className="text-sm text-foreground capitalize">
                      {val === "yes" ? "Yes, I am an accredited investor" : "No, I am not currently accredited"}
                    </span>
                  </label>
                ))}
              </div>
              <FieldError message={form4.formState.errors.isAccreditedInvestor?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="investmentObjective">Investment Objective</Label>
              <select id="investmentObjective" {...form4.register("investmentObjective")} className={SELECT_CLASS}>
                <option value="">Select objective</option>
                <option value="capital-preservation">Capital Preservation</option>
                <option value="income">Income Generation</option>
                <option value="growth">Balanced Growth</option>
                <option value="aggressive-growth">Aggressive Growth</option>
                <option value="speculation">Speculation</option>
              </select>
              <FieldError message={form4.formState.errors.investmentObjective?.message} />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => setSection(3)}>
              <span className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back</span>
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">Submit & Continue <ArrowRight className="h-4 w-4" /></span>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
