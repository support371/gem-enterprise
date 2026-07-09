"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginResponse = {
  success?: boolean;
  role?: string;
  kycStatus?: string;
  redirect?: string;
  error?: string;
};

function safeRedirectTarget(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const body = (await res.json().catch(() => ({}))) as LoginResponse;

      if (!res.ok) {
        setServerError(
          body?.error || "Invalid credentials. Please check your email and password.",
        );
        return;
      }

      const requestedNext = safeRedirectTarget(searchParams.get("next"));
      const apiRedirect = safeRedirectTarget(body.redirect);
      const target = requestedNext ?? apiRedirect ?? "/access/continue";

      router.replace(target);
    } catch {
      setServerError("A network error occurred. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background cyber-grid">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[hsl(var(--electric-cyan)/0.06)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[hsl(var(--night-plum)/0.08)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 flex flex-col items-center">
          <div className="glass-panel glow-cyan mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9"
              aria-hidden="true"
            >
              <path
                d="M20 3L5 10v10c0 9.39 6.39 18.17 15 20.31C29.61 38.17 36 29.39 36 20V10L20 3z"
                fill="hsl(var(--electric-cyan)/0.15)"
                stroke="hsl(var(--electric-cyan))"
                strokeWidth="1.5"
              />
              <path
                d="M14 20l4 4 8-8"
                stroke="hsl(var(--electric-cyan))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="mb-1 font-mono text-xs uppercase tracking-widest text-[hsl(var(--electric-cyan))]">
            GEM Enterprise
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Client Portal Access
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Sign in to an authorized client or administrator account
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-lg">
          {serverError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
                className="border-border bg-[hsl(var(--input))] focus:ring-[hsl(var(--electric-cyan))]"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[hsl(var(--electric-cyan))] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
                className="border-border bg-[hsl(var(--input))] focus:ring-[hsl(var(--electric-cyan))]"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-[hsl(var(--electric-cyan))] font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              {isSubmitting ? "Signing In…" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 grid gap-2 text-center text-sm text-muted-foreground">
            <p>
              New client?{" "}
              <Link
                href="/get-started"
                className="font-medium text-[hsl(var(--electric-cyan))] hover:underline"
              >
                Begin application
              </Link>
            </p>
            <p>
              Checking access first?{" "}
              <Link
                href="/eligibility/status"
                className="font-medium text-[hsl(var(--electric-cyan))] hover:underline"
              >
                View eligibility status
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          Use only an account assigned to you. Do not share credentials or submit identity
          documents through email or public forms.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} GEM Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
}
