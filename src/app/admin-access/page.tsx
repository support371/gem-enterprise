"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const requirements = [
  { label: "At least 16 characters", test: (value: string) => value.length >= 16 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "One number", test: (value: string) => /[0-9]/.test(value) },
  { label: "One special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function AdminAccessPage() {
  const [accessToken, setAccessToken] = useState("");
  const [linkChecked, setLinkChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [authorizationFailure, setAuthorizationFailure] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = window.location.hash.replace(/^#/, "");
    const parameters = new URLSearchParams(fragment);
    const token = parameters.get("token") || parameters.get("access_token") || "";
    setAccessToken(token);
    setLinkChecked(true);

    // Remove the capability from the visible URL after it is captured in memory.
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const requirementResults = useMemo(
    () => requirements.map((requirement) => ({
      ...requirement,
      passed: requirement.test(password),
    })),
    [password],
  );
  const passwordValid = requirementResults.every((item) => item.passed);
  const confirmationValid = confirmation.length > 0 && password === confirmation;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !passwordValid || !confirmationValid) return;

    setSubmitting(true);
    setAuthorizationFailure(false);
    setError(null);

    try {
      const response = await fetch("/api/admin-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };

      if (!response.ok) {
        if (body.code === "INVALID_TOKEN") {
          setAuthorizationFailure(true);
          throw new Error(
            "The one-time authorization is missing, expired, or already used. Start a new authorization and verify it before returning to this page.",
          );
        }
        throw new Error(body.error || "The administrator password could not be set.");
      }

      setAccessToken("");
      setPassword("");
      setConfirmation("");
      setCompleted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The administrator password could not be set.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!linkChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07101f] px-4">
        <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
      </main>
    );
  }

  if (completed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07101f] px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl border border-green-500/25 bg-green-500/[0.06] p-8 text-center shadow-2xl">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
          <h1 className="mt-5 text-2xl font-bold text-white">Administrator password set</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The setup capability has been consumed and cannot be used again. Sign in with the administrator email and the password you just created.
          </p>
          <Button asChild className="mt-7 w-full bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
            <Link href="/client-login">Continue to administrator sign-in</Link>
          </Button>
        </section>
      </main>
    );
  }

  if (!accessToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07101f] px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-8 text-center shadow-2xl">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-400" />
          <h1 className="mt-5 text-2xl font-bold text-white">Setup link unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This page requires a valid one-time setup link. The link may be incomplete, expired, or already consumed.
          </p>
          <Button asChild className="mt-7 w-full bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
            <Link href="/admin-access/authorize">Start a new authorization</Link>
          </Button>
          <Button asChild variant="outline" className="mt-3 w-full border-white/15 text-white">
            <Link href="/client-login">Return to sign-in</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07101f] px-4 py-12 text-white">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3">
            <KeyRound className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <ShieldCheck className="h-4 w-4" /> One-time administrator setup
            </div>
            <h1 className="mt-2 text-2xl font-bold">Create your administrator password</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The setup capability was captured from the protected link and removed from the address bar. It will be invalidated after a successful password change.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                maxLength={256}
                className="border-white/10 bg-black/20 pr-12 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {requirementResults.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 text-xs ${item.passed ? "text-green-400" : "text-slate-500"}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> {item.label}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">Confirm password</Label>
            <Input
              id="confirmation"
              type={showPassword ? "text" : "password"}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="new-password"
              maxLength={256}
              className="border-white/10 bg-black/20 text-white"
            />
            {confirmation.length > 0 && !confirmationValid && (
              <p className="text-xs text-red-400">The passwords do not match.</p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
              <p>{error}</p>
              {authorizationFailure ? (
                <Button asChild variant="outline" className="mt-4 w-full border-red-300/30 text-red-100">
                  <Link href="/admin-access/authorize">Start a new authorization</Link>
                </Button>
              ) : null}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !passwordValid || !confirmationValid || authorizationFailure}
            className="w-full bg-cyan-400 font-semibold text-black hover:bg-cyan-300"
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting password</>
            ) : (
              "Set administrator password"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          GEM will never ask you to send this password through email, chat, or a support ticket.
        </p>
      </section>
    </main>
  );
}
