"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  redirectPath = "/client-login?signedOut=1",
}: {
  className?: string;
  redirectPath?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Sign out failed");
      router.replace(redirectPath);
      router.refresh();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={busy}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-red-300 outline-none transition hover:bg-red-400/10 hover:text-red-200 focus:bg-red-400/10 disabled:cursor-wait disabled:opacity-70",
        className,
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
      {busy ? "Signing out…" : failed ? "Retry secure sign out" : "Sign out securely"}
    </button>
  );
}
