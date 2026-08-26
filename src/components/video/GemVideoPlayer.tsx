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
            
           </div>






















































































