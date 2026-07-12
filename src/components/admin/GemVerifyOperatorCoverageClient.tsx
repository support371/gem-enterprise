"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type UserRecord = {
  id: string;
  role: string;
  status: string;
  isActive: boolean;
  isEmailVerified: boolean;
};

type UsersResponse = {
  users?: UserRecord[];
  error?: string;
};

async function readBody<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

function badgeTone(passed: boolean) {
  return passed
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    : "border-amber-400/30 bg-amber-400/10 text-amber-200";
}

export default function GemVerifyOperatorCoverageClient() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign(
          "/client-login?next=%2Fapp%2Fadmin%2Fgem-verify%2Fevidence%2Fgovernance",
        );
        return;
      }
      const body = await readBody<UsersResponse>(response);
      if (!response.ok) {
        throw new Error(body.error ?? "Operator coverage is unavailable.");
      }
      setUsers(body.users ?? []);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Operator coverage is unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const coverage = useMemo(() => {
    const eligible = users.filter(
      (user) =>
        user.isActive &&
        user.isEmailVerified &&
        user.status === "active",
    );
    const analysts = eligible.filter((user) => user.role === "analyst").length;
    const administrators = eligible.filter((user) =>
      ["admin", "super_admin", "internal"].includes(user.role),
    ).length;
    const superAdministrators = eligible.filter(
      (user) => user.role === "super_admin",
    ).length;

    return {
      analysts,
      administrators,
      superAdministrators,
      reviewCoverage: analysts >= 1,
      twoPersonCoverage: administrators >= 2,
      policyDecisionCoverage: superAdministrators >= 1,
    };
  }, [users]);

  const complete =
    coverage.reviewCoverage &&
    coverage.twoPersonCoverage &&
    coverage.policyDecisionCoverage;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/55 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
            <Users className="h-5 w-5" aria-hidden="true" />
            Authorized operator coverage
          </div>
          <h2 className="mt-2 text-xl font-black text-white">
            Review and Decision Roles
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            GEM Verify requires separate review, policy-decision and activation
            operators. This panel reads active, verified GEM accounts only and
            does not change any role.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Refresh coverage
        </Button>
      </div>

      {error ? (
        <div className="mt-5 flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <UserCog className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
            Active analysts
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {coverage.analysts}
          </p>
          <Badge className={`mt-2 ${badgeTone(coverage.reviewCoverage)}`}>
            {coverage.reviewCoverage ? "Review covered" : "Analyst required"}
          </Badge>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <ShieldCheck className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
            Super administrators
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {coverage.superAdministrators}
          </p>
          <Badge
            className={`mt-2 ${badgeTone(coverage.policyDecisionCoverage)}`}
          >
            {coverage.policyDecisionCoverage
              ? "Policy decisions covered"
              : "Super admin required"}
          </Badge>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <Users className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
            Administrator-level operators
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {coverage.administrators}
          </p>
          <Badge className={`mt-2 ${badgeTone(coverage.twoPersonCoverage)}`}>
            {coverage.twoPersonCoverage
              ? "Two-person control covered"
              : "Second operator required"}
          </Badge>
        </div>
      </div>

      <div
        className={`mt-5 flex gap-3 rounded-xl border p-4 text-sm leading-6 ${
          complete
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
            : "border-amber-400/25 bg-amber-400/[0.07] text-amber-100"
        }`}
      >
        {complete ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        )}
        <span>
          {complete
            ? "Role coverage is sufficient for separated review, policy approval and upload activation."
            : "Activation remains blocked until GEM has at least one active verified analyst, one super administrator and two distinct administrator-level operators."}
        </span>
      </div>
    </section>
  );
}
