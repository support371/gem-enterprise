"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  organization: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(200, "Organization name must be under 200 characters"),
  subject: z.enum(
    ["general", "security-incident", "partnership", "other"],
    { required_error: "Please select a subject" }
  ),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(5000, "Message must be under 5000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

type FormStatus = "idle" | "loading" | "success" | "error";

const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "security-incident", label: "Security Incident" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    setErrorMessage("");

    try {
      // Simulate POST to /api/contact
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Stub: always resolve for now
          resolve();
        }, 1500);
      });

      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      setErrorMessage(
        "An error occurred while submitting your message. Please try again or contact us directly."
      );
    }
  };

  if (status === "success") {
    return (
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="p-4 rounded-full bg-primary/10 border border-primary/30 w-fit mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">Message Received</h3>
          <p className="text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
            Your message has been received. Our team will respond within 1 business day.
            For urgent security incidents, please use the emergency escalation contact provided.
          </p>
          <Button
            variant="outline"
            onClick={() => setStatus("idle")}
          >
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
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-foreground"
            >
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Your full legal name"
              {...register("fullName")}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                errors.fullName
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-border/60 focus:border-primary/50"
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@organization.com"
              {...register("email")}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                errors.email
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-border/60 focus:border-primary/50"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-1.5">
            <label
              htmlFor="organization"
              className="text-sm font-medium text-foreground"
            >
              Organization <span className="text-destructive">*</span>
            </label>
            <input
              id="organization"
              type="text"
              autoComplete="organization"
              placeholder="Your company or institution"
              {...register("organization")}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                errors.organization
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-border/60 focus:border-primary/50"
              }`}
            />
            {errors.organization && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.organization.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label
              htmlFor="subject"
              className="text-sm font-medium text-foreground"
            >
              Subject <span className="text-destructive">*</span>
            </label>
            <select
              id="subject"
              {...register("subject")}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors appearance-none cursor-pointer ${
                errors.subject
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-border/60 focus:border-primary/50"
              }`}
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
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label
              htmlFor="message"
              className="text-sm font-medium text-foreground"
            >
              Message <span className="text-destructive">*</span>
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Describe your inquiry, organization context, and any relevant details..."
              {...register("message")}
              className={`w-full px-4 py-2.5 rounded-lg bg-input border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none ${
                errors.message
                  ? "border-destructive focus:ring-destructive/50"
                  : "border-border/60 focus:border-primary/50"
              }`}
            />
            {errors.message && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Error state */}
          {status === "error" && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full gap-2"
            size="lg"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            All communications are handled with strict confidentiality. We do not share your information with third parties.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
