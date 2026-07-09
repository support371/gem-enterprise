import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function ProductionDisclosure() {
  return (
    <aside
      aria-label="Controlled launch notice"
      className="border-b border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2.5"
    >
      <div className="mx-auto flex max-w-screen-2xl items-start gap-2.5 text-xs leading-5 text-cyan-50/80 sm:items-center">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300 sm:mt-0" aria-hidden="true" />
        <p>
          <strong className="text-cyan-100">Controlled production launch:</strong>{" "}
          public capability descriptions are informational. Availability, staffing,
          coverage, response targets, providers, and regulated or sensitive workflows
          require verification and a signed scope. Sample data and illustrative images do
          not represent live operations.{" "}
          <Link href="/trust-center" className="font-semibold text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
            Trust Center
          </Link>
        </p>
      </div>
    </aside>
  );
}
