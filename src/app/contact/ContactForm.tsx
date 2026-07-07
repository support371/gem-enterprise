"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  organization: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(200, "Organization name must be under 200 characters"),
  subject: z.enum(["general", "security-incident", "partnership", "other"], {
    required_error: "Please select a subject",
  }),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(5000, "Message must be under 5000 characters"),
  website: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;
type FormStatus = "idle" | "loading" | "success" | "error";

const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "security-incident", label: "Security Incident" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
] as const;

const inputClass =
  "w-full rounded-lg border border-border/60 bg-input px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring";

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { website: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const subjectLabel =
        subjectOptions.find((option) => option.value === data.subject)?.label ??
        "Website inquiry";

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          subject: `${subjectLabel} — ${data.organization}`,
          message: `Organization: ${data.organization}\n\n${data.message}`,
          website: data.website,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Message submission failed");
      }

      setStatus("success");
      reset();
    } catch (error) {
      console.error("[contact-form] submission failed", error);
      setStatus("error");
      setErrorMessage(
        "We could not submit your message. Please try again or use the published support contact.",
      );
    }
  };

  if (status === "success") {
    return (
      <Card className="glass-panel border-primary/20">
        <CardContent className="pb-8 pt-8 text-center">
          <div className="mx-auto mb-6 w-fit rounded-full border border-primary/30 bg-primary/10 p-4">
            <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <h3 className="mb-3 text-xl font-bold">Message Submitted</h3>
          <p className="mx-auto mb-6 max-w-md leading-relaxed text-muted-foreground">
            Your message was accepted by our contact system. Response times vary by inquiry type and service coverage.
          </p>
          <Button variant="outline" onClick={() => setStatus("idle")}>
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-border/50">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              {...register("fullName")}
              className={inputClass}
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@organization.com"
              {...register("email")}
              className={inputClass}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="organization" className="text-sm font-medium text-foreground">
              Organization <span className="text-destructive">*</span>
            </label>
            <input
              id="organization"
              type="text"
              autoComplete="organization"
              placeholder="Your company or institution"
              {...register("organization")}
              className={inputClass}
              aria-invalid={Boolean(errors.organization)}
            />
            {errors.organization && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.organization.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subject" className="text-sm font-medium text-foreground">
              Subject <span className="text-destructive">*</span>
            </label>
            <select
              id="subject"
              defaultValue=""
              {...register("subject")}
              className={`${inputClass} cursor-pointer appearance-none`}
              aria-invalid={Boolean(errors.subject)}
            >
              <option value="" disabled>
                Select a subject
              </option>
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message" className="text-sm font-medium text-foreground">
              Message <span className="text-destructive">*</span>
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Describe your inquiry and relevant context..."
              {...register("message")}
              className={`${inputClass} resize-none`}
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.message.message}
              </p>
            )}
          </div>

          {status === "error" && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" aria-hidden="true" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          <Button type="submit" disabled={status === "loading"} className="w-full gap-2" size="lg">
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Send Message
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            We do not sell personal information. Information may be processed or disclosed only as described in our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            , where needed to provide services, protect the platform, or comply with law.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
