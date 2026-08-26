"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Captions, ExternalLink, Play, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { addPlaybackAutoplay, resolveVideoPlayback } from "@/lib/video/playback";

type GemVideoPlayerProps = {
  src: string | null | undefined;
  title: string;
  description?: string | null;
  poster?: string | null;
  providerHint?: string | null;
  mimeType?: string | null;
  captionsUrl?: string | null;
  externalUrl?: string | null;
  allowLocalObjectUrl?: boolean;
  showDescription?: boolean;
  /** Automatically play muted media when it enters the viewport. */
  autoPlayOnScroll?: boolean;
  className?: string;
};

function safeCaptionUrl(value: string | null | undefined): string | undefined {
  const source = value?.trim();
  if (!source) return undefined;
  if (source.startsWith("/") && !source.startsWith("//")) return source;
  try {
    const url = new URL(source);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeExternalUrl(value: string | null | undefined): string | null {
  const source = value?.trim();
  if (!source) return null;
  try {
    const url = new URL(source);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function GemVideoPlayer({
  src,
  title,
  description,
  poster,
  providerHint,
  mimeType,
  captionsUrl,
  externalUrl,
  allowLocalObjectUrl = false,
  showDescription = false,
  autoPlayOnScroll = false,
  className,
}: GemVideoPlayerProps) {
  const [activated, setActivated] = useState(false);
  const [inView, setInView] = useState(false);
  const descriptionId = useId();
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!autoPlayOnScroll || !mediaRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.55 },
    );
    observer.observe(mediaRef.current);
    return () => observer.disconnect();
  }, [autoPlayOnScroll]);

  useEffect(() => {
    const video = nativeVideoRef.current;
    if (!autoPlayOnScroll || !video) return;
    if (inView) {
      video.muted = true;
      void video.play().catch(() => {
        // Autoplay can still be blocked by browser policy; controls remain available.
      });
    } else {
      video.pause();
    }
  }, [autoPlayOnScroll, inView]);

  const playback = useMemo(
    () => resolveVideoPlayback(src, { providerHint, mimeType, allowLocalObjectUrl }),
    [allowLocalObjectUrl, mimeType, providerHint, src],
  );
  const captionSource = safeCaptionUrl(captionsUrl);
  const fallbackUrl = safeExternalUrl(playback.sourceUrl) ?? safeExternalUrl(externalUrl);
  const accessibleDescription =
    description?.trim() || `${title}. Video provided by ${playback.provider}.`;

  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-white/10 bg-black", className)}>
      <div ref={mediaRef} className="relative aspect-video w-full overflow-hidden bg-black">
        {playback.kind === "native" && playback.sourceUrl ? (
          <video
            key={playback.sourceUrl}
            src={playback.sourceUrl}
            poster={poster ?? undefined}
            controls
            playsInline
            muted={autoPlayOnScroll}
            autoPlay={autoPlayOnScroll && inView}
            preload={autoPlayOnScroll ? "auto" : "metadata"}
            onLoadedMetadata={(event) => {
              if (autoPlayOnScroll) event.currentTarget.muted = true;
            }}
            ref={nativeVideoRef}
            aria-label={title}
            aria-describedby={descriptionId}
            className="h-full w-full object-contain"
          >
            {captionSource ? (
              <track kind="captions" src={captionSource} srcLang="en" label="English" default />
            ) : null}
            Your browser does not support embedded video.
          </video>
        ) : null}

        {(playback.kind === "youtube" || playback.kind === "vimeo") && playback.embedUrl ? (
          (activated || (autoPlayOnScroll && inView)) ? (
            <iframe
              src={addPlaybackAutoplay(playback.embedUrl)}
              title={title}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              aria-describedby={descriptionId}
              className="h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setActivated(true)}
              aria-label={`Play ${title}`}
              aria-describedby={descriptionId}
              className="group absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2),transparent_62%)]"
            >
              {poster ? (
                // Publisher thumbnails are dynamic and retain source referrer isolation.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : null}
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white shadow-2xl backdrop-blur-sm transition-transform group-hover:scale-105">
                <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
              </span>
              <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                Play on {playback.provider}
              </span>
            </button>
          )
        ) : null}

        {(playback.kind === "external" || playback.kind === "unsupported") ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)] p-6 text-center">
            <VideoOff className="h-10 w-10 text-white/55" aria-hidden />
            <p className="max-w-lg text-sm leading-6 text-white/65">
              This publisher has not supplied a directly playable video format.
            </p>
            {fallbackUrl ? (
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#04121f]"
              >
                Watch at publisher <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
          </div>
        ) : null}

        {captionSource && playback.kind !== "native" ? (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/75 p-2 text-white" title="Captions available">
            <Captions className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <figcaption
        id={descriptionId}
        className={showDescription ? "border-t border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/65" : "sr-only"}
      >
        {accessibleDescription}
      </figcaption>
    </figure>
  );
}
