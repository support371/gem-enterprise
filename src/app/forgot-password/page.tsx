"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle"|"loading"|"success"|"error"|"rate-limit">(params.get("expired") ? "error" : "idle");
  const [message, setMessage] = useState(params.get("expired") ? "Your reset link has expired. Request a new secure link below." : "");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState("loading"); setMessage("");
    const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) { setState("rate-limit"); setMessage(`Too many requests. Try again in ${data.retryAfterSeconds ?? 60} seconds.`); return; }
    if (!res.ok) { setState("error"); setMessage(data.error ?? "We could not process the request."); return; }
    setState("success"); setMessage(data.message);
  }
  return <section className="mx-auto max-w-xl px-4 py-24"><div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"><p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Account recovery</p><h1 className="mt-3 text-4xl font-bold">Forgot password</h1><p className="mt-4 text-slate-300">Enter your account email. For security, responses do not reveal whether an email is registered.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm text-slate-300">Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" /></label><button disabled={state==="loading"} className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{state==="loading"?"Sending…":"Send reset instructions"}</button></form>{message && <div role="status" className={`mt-5 rounded-xl border p-4 text-sm ${state==="success"?"border-emerald-400/30 bg-emerald-400/10 text-emerald-200":"border-amber-400/30 bg-amber-400/10 text-amber-100"}`}>{message}</div>}<p className="mt-6 text-sm text-slate-400"><Link className="text-cyan-300" href="/client-login">Return to client login</Link></p></div></section>;
}
