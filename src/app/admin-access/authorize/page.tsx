"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ADMIN_ACCESS_EMAIL,
  ADMIN_ACCESS_SESSION_KEY,
  ADMIN_ACCESS_SQL_EDITOR_URL,
  generateAdminAccessAuthorization,
  parseAdminAccessAuthorization,
  serializeAdminAccessAuthorization,
  type AdminAccessAuthorization,
} from "@/lib/admin-access-authorizer";

export default function AdminAccessAuthorizePage() {
  const [authorization, setAuthorization] =
    useState<AdminAccessAuthorization | null>(null);
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sqlConfirmed, setSqlConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = parseAdminAccessAuthorization(
      window.sessionStorage.getItem(ADMIN_ACCESS_SESSION_KEY),
    );
    if (saved) setAuthorization(saved);
    else window.sessionStorage.removeItem(ADMIN_ACCESS_SESSION_KEY);
    setReady(true);
  }, []);

  const expiryLabel = useMemo(() => {
    if (!authorization) return "";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(authorization.expiresAt));
  }, [authorization]);

  async function generate() {
    setGenerating(true);
    setCopied(false);
    setSqlConfirmed(false);
    setError(null);
    try {
      const next = await generateAdminAccessAuthorization();
      window.sessionStorage.setItem(
        ADMIN_ACCESS_SESSION_KEY,
        serializeAdminAccessAuthorization(next),
      );
      setAuthorization(next);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Secure authorization could not be generated.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function copySql() {
    if (!authorization) return;
    try {
      await navigator.clipboard.writeText(authorization.sql);
      setCopied(true);
    } catch {
      setError("Copy failed. Select the SQL manually and copy it.");
    }
  }

  function continueToPasswordSetup() {
    if (!authorization || !sqlConfirmed) return;
    window.location.assign(
      `/admin-access#token=${encodeURIComponent(authorization.token)}`,
    );
  }

  function discard() {
    window.sessionStorage.removeItem(ADMIN_ACCESS_SESSION_KEY);
    setAuthorization(null);
    setCopied(false);
    setSqlConfirmed(false);
    setError(null);
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07101f] px-4">
        <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07101f] px-4 py-12 text-white">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Owner-controlled authorization
            </div>
            <h1 className="mt-2 text-2xl font-bold">
              Authorize administrator password setup
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This browser creates a one-time capability locally. Only its
              SHA-256 hash appears in the SQL statement. The usable capability
              remains in this browser session and is never copied into chat,
              email, GitHub, analytics, or the SQL editor.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Administrator account
          </p>
          <p className="mt-1 font-medium text-white">{ADMIN_ACCESS_EMAIL}</p>
        </div>

        {!authorization ? (
          <Button
            type="button"
            onClick={() => void generate()}
            disabled={generating}
            className="mt-8 w-full bg-cyan-400 font-semibold text-black hover:bg-cyan-300"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" /> Generate one-time authorization
              </>
            )}
          </Button>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="rounded-xl border border-green-500/20 bg-green-500/[0.06] p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <h2 className="font-semibold text-green-200">
                    Local capability generated
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-green-100/70">
                    It expires at {expiryLabel}. Keep this tab open while completing
                    the authorization step.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">1. Copy the authorization SQL</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    It contains only a token hash, request ID, expiry time, and a
                    constrained lookup of the approved administrator account.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copySql()}
                  className="border-white/15 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Clipboard className="mr-2 h-4 w-4" /> Copy SQL
                    </>
                  )}
                </Button>
              </div>
              <textarea
                readOnly
                value={authorization.sql}
                rows={20}
                spellCheck={false}
                className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-5 text-slate-300"
                aria-label="Administrator authorization SQL"
              />
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h2 className="font-semibold">2. Run it in the official Supabase project</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Open the SQL Editor, paste the copied statement, and run it. A
                successful result returns one authorization row. No password or
                usable capability is present in that statement.
              </p>
              <Button asChild className="mt-4 bg-cyan-400 text-black hover:bg-cyan-300">
                <a
                  href={ADMIN_ACCESS_SQL_EDITOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Supabase SQL Editor
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </section>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-100/80">
              <input
                type="checkbox"
                checked={sqlConfirmed}
                onChange={(event) => setSqlConfirmed(event.target.checked)}
                className="mt-1"
              />
              <span>
                I ran the statement in the correct Supabase project and it returned
                one authorization row.
              </span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={continueToPasswordSetup}
                disabled={!sqlConfirmed}
                className="flex-1 bg-cyan-400 font-semibold text-black hover:bg-cyan-300"
              >
                Continue to password setup
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={discard}
                className="border-white/15 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Start over
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-5 flex gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          No password is created on this page. You choose it only after the
          one-time authorization is registered.
          <Link href="/client-login" className="ml-1 text-cyan-400 hover:underline">
            Return to sign-in
          </Link>
        </p>
      </section>
    </main>
  );
}
