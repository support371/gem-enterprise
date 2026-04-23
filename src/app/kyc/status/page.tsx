import Link from "next/link";
import { Button } from "@/components/ui/button";

type StatusStage = {
  id: string;
  label: string;
  description: string;
};

const STAGES: StatusStage[] = [
  { id: "started", label: "Application Started", description: "Entity type and information collected" },
  { id: "documents_uploaded", label: "Documents Uploaded", description: "Verification documents received" },
  { id: "under_review", label: "Under Review", description: "Compliance team reviewing your application" },
  { id: "decision", label: "Decision", description: "Application outcome communicated" },
];

const STATUS_STAGE_MAP: Record<string, number> = {
  started: 0,
  in_progress: 0,
  documents_uploaded: 1,
  under_review: 2,
  manual_review: 2,
  approved: 3,
  rejected: 3,
};

function getStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case "approved":
      return { label: "Approved", color: "text-[hsl(var(--neon-lime))]" };
    case "rejected":
    case "expired":
      return { label: "Not Approved", color: "text-destructive" };
    case "under_review":
      return { label: "Under Review", color: "text-[hsl(var(--electric-cyan))]" };
    case "manual_review":
      return { label: "Additional Review Required", color: "text-amber-400" };
    case "documents_uploaded":
      return { label: "Documents Received", color: "text-[hsl(var(--electric-cyan))]" };
    default:
      return { label: "In Progress", color: "text-muted-foreground" };
  }
}

export default async function KYCStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "under_review";
  const currentStageIndex = STATUS_STAGE_MAP[status] ?? 0;
  const statusMeta = getStatusLabel(status);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">Application Status</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Track the progress of your KYC verification application.
      </p>

      {/* Current status badge */}
      <div className="glass-panel rounded-xl p-5 border border-[hsl(var(--border))] mb-6 flex items-center gap-4">
        <div className="h-10 w-10 shrink-0 rounded-full border border-[hsl(var(--border))] flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-[hsl(var(--electric-cyan))] animate-pulse" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Current Status</p>
          <p className={`font-semibold text-lg ${statusMeta.color}`}>{statusMeta.label}</p>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] mb-6">
        <h2 className="font-semibold text-foreground mb-5 text-sm">Verification Progress</h2>
        <div className="space-y-0">
          {STAGES.map((stage, idx) => {
            const completed = idx < currentStageIndex;
            const active = idx === currentStageIndex;
            const upcoming = idx > currentStageIndex;

            return (
              <div key={stage.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      completed
                        ? "bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))]"
                        : active
                        ? "border-2 border-[hsl(var(--electric-cyan))] text-[hsl(var(--electric-cyan))]"
                        : "border border-[hsl(var(--border))] text-muted-foreground"
                    }`}
                  >
                    {completed ? (
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`w-px flex-1 my-1 ${
                        completed ? "bg-[hsl(var(--electric-cyan)/0.5)]" : "bg-[hsl(var(--border))]"
                      }`}
                      style={{ minHeight: "20px" }}
                    />
                  )}
                </div>
                <div className="pb-5">
                  <p
                    className={`font-medium text-sm ${
                      upcoming ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {stage.label}
                    {active && (
                      <span className="ml-2 text-xs text-[hsl(var(--electric-cyan))] font-mono">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support note */}
      <div className="glass-panel rounded-xl p-5 border border-[hsl(var(--border))] mb-8 text-sm text-muted-foreground">
        For questions about your application status, please{" "}
        <Link href="/contact" className="text-[hsl(var(--electric-cyan))] hover:underline">
          contact our support team
        </Link>
        . Have your application reference number ready.
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
          <Link href="/hub">Return to Hub</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
