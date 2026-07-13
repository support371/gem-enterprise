import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default function EnterpriseDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Link
        href="/enterprise-demo/watch"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06111b] shadow-2xl shadow-cyan-950/40 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        aria-label="Play the full guided enterprise website demonstration"
      >
        <PlayCircle className="h-5 w-5" />
        Play full guided demo
      </Link>
    </>
  );
}
