import Link from "next/link";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VideoScript } from "@/lib/video-data/scripts";

interface VideoSectionProps {
  videos: VideoScript[];
  compact?: boolean;
}

export function VideoSection({ videos, compact = false }: VideoSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {videos.map((video) => (
        <article key={video.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
          <div className="mb-5 flex h-28 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-950 to-purple-500/10">
            <PlayCircle className="h-12 w-12 text-cyan-300" aria-hidden="true" />
          </div>
          <Badge className="mb-3 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-xs uppercase tracking-widest text-cyan-200">
            Script ready · generation gated
          </Badge>
          <h3 className="text-xl font-bold text-white">{video.title}</h3>
          <p className="mt-2 text-sm text-slate-400">
            {video.speaker} · {video.role} · approximately {video.durationSeconds}s
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            {compact ? video.disclosure : video.script.split("\n\n")[0]}
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-100">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{video.disclosure}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function VideoLibraryLink() {
  return (
    <Link href="/videos" className="inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:gap-3">
      Review governed video scripts <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
