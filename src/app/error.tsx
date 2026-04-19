"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[GEM Enterprise] Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl scale-150" />
            <div className="relative w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle
                className="w-12 h-12 text-amber-400"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Something Went Wrong
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
            An unexpected error occurred while processing your request. Our team
            has been notified. Please try again or return to the home page.
          </p>
        </div>

        {/* Error message */}
        {(error.message || error.digest) && (
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-left">
            <p className="text-xs font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">
              Error Details
            </p>
            <p className="text-sm text-[hsl(var(--foreground)/0.7)] font-mono break-all">
              {error.message || "An unknown error occurred. Please try again."}
            </p>
            {error.digest && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="w-16 h-px bg-[hsl(var(--border))] mx-auto" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
