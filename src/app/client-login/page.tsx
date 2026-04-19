"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ClientLoginPage() {
  const router = useRouter();
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

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(
          body?.error || "Invalid credentials. Please check your email and password."
        );
        return;
      }

      router.push("/access/continue");
    } catch {
      setServerError("A network error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center cyber-grid bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[hsl(var(--electric-cyan)/0.06)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[hsl(var(--night-plum)/0.08)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Shield */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glass-panel glow-cyan">
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
          <span className="font-mono text-xs tracking-widest text-[hsl(var(--electric-cyan))] uppercase mb-1">
            GEM Enterprise
          </span>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Client Portal Access
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Sign in to your secure client account
          </p>
        </div>

        {/* Glass card */}
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
                className="bg-[hsl(var(--input))] border-border focus:ring-[hsl(var(--electric-cyan))]"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
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
                className="bg-[hsl(var(--input))] border-border focus:ring-[hsl(var(--electric-cyan))]"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90 transition-opacity mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  Signing In…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            New client?{" "}
            <Link
              href="/get-started"
              className="text-[hsl(var(--electric-cyan))] font-medium hover:underline"
            >
              Begin application
            </Link>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          {["Secure", "Encrypted", "Monitored"].map((label) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--electric-cyan))]" />
              {label}
            </span>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} GEM Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  );
}
