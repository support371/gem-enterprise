"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnsubscribeControl({ token }: { token: string }) {
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
      // This is an explicit signed-link confirmation from the browser. Do not attach the
      // RFC one-click header here; mailbox one-click requests use that header themselves.
      const response = await fetch(`/api/communications/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update communication preference");
      setState("done");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to update communication preference");
    }
  }

  if (state === "done") {
    return (
      <div>
        <CheckCircle2 className="h-10 w-10 text-emerald-300" />
        <h1 className="mt-4 text-2xl font-bold text-white">Marketing email disabled</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This address has been blocked from GEM Enterprise marketing campaigns. Transactional or support messages tied to an active request, account, security notice, or service relationship are controlled separately.
        </p>
      </div>
    );
  }

  return (
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
  );
}
