"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";

type FormState = "idle" | "loading" | "success" | "error" | "rate-limit" | "expired";

export default function ForgotPasswordPage() {
  const params = useSearchParams();
  const initialState: FormState = params.get("expired") === "1" ? "expired" : "idle";

  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>(initialState);
  const [message, setMessage] = useState("");
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");
    setRetryAfter(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        const secs = data.retryAfterSeconds ?? 60;
        setRetryAfter(secs);
        setState("rate-limit");
        return;
      }
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "We could not process your request. Please try again.");
        return;
      }

      setState("success");
    } catch {
      setState("error");
      setMessage("A network error occurred. Please check your connection and try again.");
    }
  }

  function handleTryAgain() {
    setState("idle");
    setMessage("");
    setRetryAfter(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">

          {/* Header */}
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Account recovery
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            {state === "success" ? "Check your email" : "Forgot password"}
          </h1>

          {/* ── Success state ─────────────────────────────────── */}
          {state === "success" && (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                <span className="mt-0.5 text-emerald-400 text-base leading-none">✓</span>
                <div>
                  <p className="font-semibold">Instructions sent</p>
                  <p className="mt-1 leading-relaxed">
                    If an active GEM Enterprise account exists for{" "}
                    <strong className="text-white">{email}</strong>, password reset instructions
                    have been sent. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-slate-400">
                <li className="flex gap-2"><span className="text-slate-500">▸</span>The link expires in 30 minutes.</li>
                <li className="flex gap-2"><span className="text-slate-500">▸</span>Do not share the reset link with anyone.</li>
                <li className="flex gap-2"><span className="text-slate-500">▸</span>GEM Enterprise will never ask for your password by email.</li>
              </ul>
              <button
                onClick={handleTryAgain}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >
                Send to a different email
              </button>
            </div>
          )}

          {/* ── Rate-limit state ──────────────────────────────── */}
          {state === "rate-limit" && (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                <span className="mt-0.5 text-amber-400 text-base leading-none">⚠</span>
                <div>
                  <p className="font-semibold">Too many requests</p>
                  <p className="mt-1 leading-relaxed">
                    For security, password reset requests are rate-limited.
                    {retryAfter !== null && (
                      <> Please wait <strong className="text-white">{retryAfter} seconds</strong> before trying again.</>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTryAgain}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* ── Expired-link banner (idle) ─────────────────────── */}
          {state === "expired" && (
            <>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                <span className="mt-0.5 text-amber-400 text-base leading-none">⏱</span>
                <div>
                  <p className="font-semibold">Reset link expired</p>
                  <p className="mt-1 leading-relaxed">
                    Your password reset link has expired (links are valid for 30 minutes). Enter
                    your email below to request a new one.
                  </p>
                </div>
              </div>
              {renderForm()}
            </>
          )}

          {/* ── Idle / error state ────────────────────────────── */}
          {(state === "idle" || state === "loading" || state === "error") && (
            <>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                Enter your account email address. For security, we do not confirm whether an email
                is registered.
              </p>

              {state === "error" && message && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
                  <span className="mt-0.5 text-red-400 text-base leading-none">✕</span>
                  <p>{message}</p>
                </div>
              )}

              {renderForm()}
            </>
          )}

          {/* Return to login */}
          {state !== "rate-limit" && (
            <p className="mt-6 text-center text-sm text-slate-400">
              <Link href="/client-login" className="text-cyan-300 hover:text-cyan-200 transition-colors">
                ← Return to client login
              </Link>
            </p>
          )}
        </div>

        {/* Security note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          GEM Enterprise uses encrypted, time-limited reset tokens. We will never ask for your
          password via email or phone.
        </p>
      </div>
    </main>
  );

  function renderForm() {
    return (
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-300" htmlFor="email">
            Email address
          </label>
          <input
            ref={inputRef}
            id="email"
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === "loading"}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading" || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {state === "loading" ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              Sending…
            </>
          ) : (
            "Send reset instructions"
          )}
        </button>
      </form>
    );
  }
}
