import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveAccessDestination } from "@/lib/auth";
import type { SessionPayload, KYCStatus, AuthRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccessContinuePage() {
  const headersList = await headers();

  const userId = headersList.get("x-user-id");
  const kycStatus = headersList.get("x-kyc-status") as KYCStatus | null;
  const userRole = headersList.get("x-user-role") as AuthRole | null;

  if (!userId) {
    redirect("/client-login");
  }

  const session: SessionPayload = {
    userId,
    email: "",
    role: userRole ?? "client",
    kycStatus: kycStatus ?? "not_started",
    entitlements: [],
  };

  const destination = resolveAccessDestination(session);
  redirect(destination);

  // This UI renders momentarily before the server redirect executes.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-2 border-[hsl(var(--electric-cyan))] border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-mono tracking-wider">
          Validating access…
        </p>
      </div>
    </div>
  );
}
