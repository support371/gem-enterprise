import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export const metadata = { title: "Authentication Required" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl scale-150" />
            <div className="relative w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Lock
                className="w-12 h-12 text-amber-400"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Authentication Required
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
            You must be signed in to access this resource. Please authenticate
            with your GEM Enterprise credentials to continue.
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-[hsl(var(--border))] mx-auto" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90">
            <Link href="/client-login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]">
            <Link href="/">Return Home</Link>
          </Button>
        </div>

        {/* Status code */}
        <p className="text-xs text-[hsl(var(--muted-foreground)/0.5)] font-mono tracking-widest">
          HTTP 401 — UNAUTHORIZED
        </p>
      </div>
    </div>
  );
}
