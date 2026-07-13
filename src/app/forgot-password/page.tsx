"use client";

import Link from "next/link";
import { Suspense, useState } from "react";

type FormState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "rate-limit"
  | "unavailable";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [recoveryUrl, setRecoveryUrl] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    setRecoveryUrl("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        retryAfterSeconds?: number;
        recoveryUrl?: string;
      };

      if (response.status === 429) {
        setState("rate-limit");
        setMessage(`Too many requests. Try again in ${data.retryAfterSeconds ?? 60} seconds.`);
        return;
      }
      if (!response.ok) {
        const ownerRecoveryAvailable =
          response.status === 503 && Boolean(data.recoveryUrl);
        setState(ownerRecoveryAvailable ? "unavailable" : "error");
        setMessage(data.error ?? "We could not process the request.");
        setRecoveryUrl(data.recoveryUrl ?? "");
        return;
      }

      setState("success");
      setMessage(
        data.message ??
          "If an active account exists, a secure reset link has been requested.",
      );
    } catch {
      setState("error");
      setMessage("The recovery service is temporarily unavailable. Please try again.");
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Account recovery</p>
        <h1 className="mt-3 text-4xl font-bold">Forgot password</h1>
        <p className="mt-4 text-slate-300">
          Enter your account email. For security, the response does not reveal whether an account exists.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm text-slate-300">
            Email address
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
            />
          </label>
          <button
            disabled={state === "loading"}
            className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {state === "loading" ? "Requesting…" : "Request secure reset link"}
          </button>
        </form>

        {message ? (
          <div
            role="status"
            className={`mt-5 rounded-xl border p-4 text-sm ${
              state === "success"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-amber-400/30 bg-amber-400/10 text-amber-100"
            }`}
          >
            {message}
          </div>
        ) : null}

        {recoveryUrl ? (
          <div className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-slate-200">
            <p>
              Platform owner access does not require an email reset. Open
              Command Center and use <strong>Settings → Administrator credential recovery</strong>.
            </p>
            <Link
              className="mt-3 inline-flex rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950"
              href={recoveryUrl}
            >
              Open Command Center recovery
            </Link>
          </div>
        ) : null}

        <p className="mt-6 text-sm text-slate-400">
          <Link className="text-cyan-300" href="/client-login">
            Return to client login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-xl px-4 py-24 text-slate-300">Loading recovery form…</section>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
