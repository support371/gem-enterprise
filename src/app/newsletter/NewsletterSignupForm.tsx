"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type FormState = "idle" | "submitting" | "pending" | "active" | "error";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20";

export default function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmation = new URLSearchParams(window.location.search).get(
      "confirmation",
    );
    if (confirmation === "confirmed") {
      setState("active");
      setMessage("Your email is confirmed. You are now subscribed.");
    } else if (confirmation === "invalid") {
      setState("error");
      setMessage("This confirmation link is invalid or has already been used.");
    } else if (confirmation === "unavailable") {
      setState("error");
      setMessage("Confirmation is temporarily unavailable. Please try again later.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, website }),
      });
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; state?: string; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Subscription request failed");
      }

      if (result.state === "already_subscribed") {
        setState("active");
        setMessage("This email address is already subscribed.");
        return;
      }

      setState("pending");
      setMessage(
        "Check your inbox and confirm your email. You will not be added to the active mailing list until confirmation.",
      );
      setEmail("");
      setConsent(false);
    } catch (error) {
      console.error("[newsletter-form] submission failed", error);
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Your request could not be submitted. Please try again later.",
      );
    }
  }

  const isSubmitting = state === "submitting";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111a27]/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
        <Mail className="h-6 w-6 text-cyan-300" aria-hidden="true" />
      </div>

      <h2 className="text-2xl font-bold text-white">Join the mailing list</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">
        Receive opt-in cybersecurity awareness, threat-intelligence summaries,
        service updates, and operational-risk guidance from GEM.
      </p>

      <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
        <div>
          <label htmlFor="newsletter-email" className="text-sm font-medium text-white">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={`${inputClass} mt-2`}
            disabled={isSubmitting}
          />
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="newsletter-website">Website</label>
          <input
            id="newsletter-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            disabled={isSubmitting}
            className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent accent-cyan-300"
          />
          <span className="text-sm leading-6 text-white/70">
            I agree to receive GEM Security Intelligence Updates by email. I
            understand that I must confirm my address and can unsubscribe at any
            time.
          </span>
        </label>

        {message && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
              state === "error"
                ? "border-red-400/30 bg-red-400/10 text-red-100"
                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
            }`}
            role="status"
          >
            {state === "error" ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            <span>{message}</span>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2"
          disabled={isSubmitting || !email.trim() || !consent}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending confirmation...
            </>
          ) : (
            "Request subscription"
          )}
        </Button>
      </form>

      <p className="mt-5 text-xs leading-5 text-white/40">
        GEM does not use purchased, scraped, or third-party mailing lists. See
        our{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-white/70">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-white/70">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
