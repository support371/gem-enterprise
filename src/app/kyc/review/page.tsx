import Link from "next/link";
import { Button } from "@/components/ui/button";

const NEXT_STEPS = [
  {
    step: 1,
    title: "Documents Verified",
    description: "Our system verifies the authenticity and completeness of your uploaded documents.",
  },
  {
    step: 2,
    title: "Compliance Review",
    description: "A compliance specialist reviews your application against regulatory requirements.",
  },
  {
    step: 3,
    title: "Decision",
    description: "You will be notified by email of the outcome of your application.",
  },
];

export default function KYCReviewPage() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success icon */}
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--neon-lime)/0.15)] border-2 border-[hsl(var(--neon-lime)/0.5)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(var(--neon-lime))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-3">Application Under Review</h1>
      <p className="text-muted-foreground mb-2">
        Your application has been submitted successfully.
      </p>
      <p className="text-sm text-muted-foreground mb-10">
        A confirmation has been sent to your registered email address.
      </p>

      {/* What happens next */}
      <div className="glass-panel rounded-xl p-6 border border-[hsl(var(--border))] text-left mb-6">
        <h2 className="font-semibold text-foreground mb-5">What Happens Next</h2>
        <div className="space-y-5">
          {NEXT_STEPS.map((item, idx) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--electric-cyan)/0.15)] border border-[hsl(var(--electric-cyan)/0.4)] text-sm font-semibold text-[hsl(var(--electric-cyan))]">
                  {item.step}
                </div>
                {idx < NEXT_STEPS.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-[hsl(var(--border))]" style={{ minHeight: "24px" }} />
                )}
              </div>
              <div className="pb-4">
                <p className="font-medium text-foreground text-sm">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-panel rounded-xl p-5 border border-[hsl(var(--border))] text-left mb-8">
        <h3 className="font-medium text-foreground text-sm mb-2">Expected Timeline</h3>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Standard review:</span> 2–5 business days.{" "}
          <span className="font-medium text-foreground">Manual review:</span> 7–14 business days.
          You will be notified via email when a decision is made.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-[hsl(var(--electric-cyan))] text-[hsl(var(--primary-foreground))] font-semibold hover:opacity-90">
          <Link href="/kyc/status">Check Status</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
