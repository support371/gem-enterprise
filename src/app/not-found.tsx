import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[hsl(220,15%,12%)] px-4">
      {/* Cyber-grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(185 100% 45% / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(185 100% 45% / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-[hsl(185,100%,45%)]/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Shield icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[hsl(185,100%,45%)]/20 bg-[hsl(185,100%,45%)]/10">
          <ShieldCheck
            className="h-8 w-8 text-[hsl(185,100%,45%)]"
            strokeWidth={1.5}
          />
        </div>

        {/* 404 */}
        <p className="text-8xl font-black tracking-tighter text-[hsl(185,100%,45%)] sm:text-9xl">
          404
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="max-w-sm text-sm leading-relaxed text-white/50">
          The resource you&apos;re looking for doesn&apos;t exist or has been
          moved. If you believe this is an error, please contact support.
        </p>

        {/* CTA buttons */}
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            asChild
            className="bg-[hsl(185,100%,45%)] text-[hsl(220,15%,12%)] font-semibold hover:bg-[hsl(185,100%,40%)]"
          >
            <Link href="/">Return Home</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-transparent text-white/80 hover:border-[hsl(185,100%,45%)] hover:bg-[hsl(185,100%,45%)]/10 hover:text-[hsl(185,100%,45%)]"
          >
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>

        {/* Bottom label */}
        <p className="mt-4 font-mono text-xs text-white/20">
          GEM ENTERPRISE &mdash; Regulated | Compliant | Secure
        </p>
      </div>
    </main>
  );
}
