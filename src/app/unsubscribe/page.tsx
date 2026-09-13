import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { UnsubscribeControl } from "@/components/communications/UnsubscribeControl";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-6 py-16">
      <section className="w-full rounded-2xl border border-white/10 bg-card p-6 shadow-2xl sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-wider text-cyan-200">
          <ShieldCheck className="h-3.5 w-3.5" /> Communication control
        </div>

        <UnsubscribeControl token={token} />

        <div className="mt-8 border-t border-white/10 pt-5">
          <Link href="/" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            Return to GEM Enterprise
          </Link>
        </div>
      </section>
    </main>
  );
}
