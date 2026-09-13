"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function unsubscribe() {
    if (!token) {
      setState("error");
      setMessage("This unsubscribe link is incomplete.");
      return;
    }
    setState("working");
    setMessage("");
    try {
      const response = await fetch(`/api/communications/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update communication preference");
      setState("done");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to update communication preference");
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-16">
      <section className="w-full rounded-2xl border border-white/10 bg-card p-6 shadow-2xl sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wider text-cyan-200">
          <ShieldCheck className="h-3.5 w-3.5" /> Communication control
        </div>

        {state === "done" ? (
          <div>
            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
            <h1 className="mt-4 text-2xl font-bold text-white">Marketing email disabled</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This address has been blocked from GEM Enterprise marketing campaigns. Transactional or support messages tied to an active request, account, security notice, or service relationship are controlled separately.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-white">Stop marketing email</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Confirm below to block this address from GEM Enterprise marketing campaigns. This does not close an account, cancel an active service, or suppress required transactional and support notices.
            </p>
            {state === "error" && (
              <p role="alert" className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                {message}
              </p>
            )}
            <Button type="button" className="mt-6 gap-2" onClick={() => void unsubscribe()} disabled={state === "working" || !token}>
              {state === "working" && <Loader2 className="h-4 w-4 animate-spin" />}
              Unsubscribe from marketing
            </Button>
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-5">
          <Link href="/" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Return to GEM Enterprise
          </Link>
        </div>
      </section>
    </main>
  );
}
