import Link from "next/link";

export const metadata = {
  title: "Get Started | GEM Enterprise",
  description: "Start a secure GEM Enterprise onboarding flow with a unified platform intake experience.",
};

const eligibilitySignals = [
  "Regulated financial services, trust, or real-asset operations",
  "Active cybersecurity, compliance, or digital-asset exposure",
  "Need for monitored onboarding, risk review, or secure client access",
];

const onboardingSteps = [
  {
    title: "Confirm eligibility",
    description: "Share your operating profile so GEM can route you to the right enterprise workflow.",
  },
  {
    title: "Complete secure intake",
    description: "Move through one platform-controlled onboarding path instead of duplicated marketing forms.",
  },
  {
    title: "Activate the right lane",
    description: "Transition into client portal, trust services, or cybersecurity engagement workflows.",
  },
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/60 px-6 py-24 sm:py-28 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.12),transparent_30%)]" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="mx-auto mb-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Enterprise onboarding
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Start with one clean path into GEM Enterprise.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Validate fit, protect context, and move into the right service lane through a unified intake experience that inherits the platform header, theme, and global layout.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              Check Eligibility
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {onboardingSteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                {index + 1}
              </div>
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Fit criteria</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for serious operating environments.
              </h2>
              <p className="mt-4 text-muted-foreground">
                This page intentionally renders no local navigation, no hard-coded menu lists, and no copied marketing header. The global app layout owns the header and footer.
              </p>
            </div>
            <div className="space-y-4">
              {eligibilitySignals.map((signal) => (
                <div key={signal} className="flex gap-3 rounded-xl border border-border/60 bg-background/60 p-4">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span className="text-sm leading-6 text-muted-foreground">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
