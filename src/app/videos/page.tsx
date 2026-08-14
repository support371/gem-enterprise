import { Badge } from "@/components/ui/badge";
import { VideoSection } from "@/components/videos/VideoSection";
import { videoScripts } from "@/lib/video-data/scripts";

export const metadata = {
  title: "GEM Enterprise Governed Video Library",
  description:
    "Approved script catalogue for future GEM Enterprise AI-avatar videos, with provider activation gated until owner approval.",
};

export default function VideosPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto max-w-7xl px-6 py-24">
        <Badge className="mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs uppercase tracking-widest text-cyan-200">
          Video Library
        </Badge>
        <h1 className="max-w-4xl text-5xl font-black text-white">Governed GEM Enterprise video scripts</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400">
          These scripts are ready for an approved video-generation workflow. Provider credentials, avatar rights,
          voice configuration, billing approval, and legal review remain manual dependencies before any generated
          video is published.
        </p>
        <div className="mt-10">
          <VideoSection videos={videoScripts} />
        </div>
      </section>
    </main>
  );
}
