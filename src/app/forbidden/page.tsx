import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export const metadata = { title: "Access Restricted" };

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/10 blur-2xl scale-150" />
            <div className="relative w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <ShieldX
                className="w-12 h-12 text-red-400"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            Access Restricted
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
            You don&apos;t have permission to access this resource. If you believe
            this is an error, please contact support and reference the page
            you were attempting to access.
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-[hsl(var(--border))] mx-auto" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90">
            <Link href="/app/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>

        {/* Status code */}
        <p className="text-xs text-[hsl(var(--muted-foreground)/0.5)] font-mono tracking-widest">
          HTTP 403 — FORBIDDEN
        </p>
      </div>
    </div>
  );
}
