import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PortalPage() {
  redirect("/access/continue");

  // Thin redirect wrapper — renders briefly before server redirect executes.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background cyber-grid gap-4">
      <div className="h-10 w-10 rounded-full border-2 border-[hsl(var(--electric-cyan))] border-t-transparent animate-spin" />
      <p className="text-muted-foreground text-sm font-mono tracking-wider">
        Redirecting to your account…
      </p>
    </div>
  );
}
