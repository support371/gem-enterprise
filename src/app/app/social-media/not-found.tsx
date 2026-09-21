import Link from "next/link";
import { ArrowLeft, CircleOff } from "lucide-react";

export default function SocialMediaNotFound() {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/75 p-8 text-center">
      <CircleOff className="mx-auto h-8 w-8 text-slate-500" />
      <h2 className="mt-4 text-xl font-bold text-white">Social Media Suite page not found</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
        The requested workspace route does not exist. Return to the governed Social Media Suite dashboard.
      </p>
      <Link href="/app/social-media" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-black hover:bg-cyan-300">
        <ArrowLeft className="h-4 w-4" /> Back to Social Media Suite
      </Link>
    </div>
  );
}
