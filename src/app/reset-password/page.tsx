"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fragment = window.location.hash.replace(/^#/, "");
    const fragmentToken = new URLSearchParams(fragment).get("token") ?? "";
    setToken(fragmentToken);
    setTokenLoaded(true);

    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    if (!fragmentToken) {
      setState("error");
      setMessage("This password reset link is missing its security token.");
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setState("error");
      setMessage("This password reset link is missing its security token.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setState("error");
      setMessage("The passwords do not match.");
      return;
    }

    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "The password could not be reset.");
        return;
      }
      setState("success");
      setMessage(data.message ?? "Your password has been reset.");
      setToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setState("error");
      setMessage("The recovery service is temporarily unavailable. Please try again.");
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Secure recovery</p>
        <h1 className="mt-3 text-4xl font-bold">Set a new password</h1>
        <p className="mt-4 text-slate-300">
          Reset links expire after 15 minutes and stop working after the password changes.
        </p>

        {state !== "success" ? (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block text-sm text-slate-300">
              New password
              <input
                required
                minLength={12}
                maxLength={256}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Confirm new password
              <input
                required
                minLength={12}
                maxLength={256}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>
            <button
              disabled={state === "loading" || !tokenLoaded || !token}
              className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
            >
              {state === "loading" ? "Updating…" : "Reset password"}
            </button>
          </form>
        ) : null}

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

        <p className="mt-6 text-sm text-slate-400">
          <Link className="text-cyan-300" href={state === "success" ? "/client-login" : "/forgot-password"}>
            {state === "success" ? "Continue to client login" : "Request another reset link"}
          </Link>
        </p>
      </div>
    </section>
  );
}
