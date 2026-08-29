export type VideoPlaybackKind = "youtube" | "vimeo" | "native" | "external" | "unsupported";

export type VideoPlayback = {
  kind: VideoPlaybackKind;
  sourceUrl: string | null;
  embedUrl: string | null;
  provider: string;
};

type ResolveVideoPlaybackOptions = {
  providerHint?: string | null;
  mimeType?: string | null;
  allowLocalObjectUrl?: boolean;
};

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{5,12}$/;
const NATIVE_VIDEO_PATH = /\.(?:m4v|mov|mp4|og[gv]|webm)$/i;

function youtubeId(url: URL): string | null {
  let candidate: string | null = null;
  if (url.hostname === "youtu.be") {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    candidate = url.searchParams.get("v");
    if (!candidate) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "live", "shorts"].includes(parts[0] ?? "")) {
        candidate = parts[1] ?? null;
      }
    }
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

function vimeoId(url: URL): string | null {
  if (!VIMEO_HOSTS.has(url.hostname)) return null;
  const candidate = url.pathname.split("/").filter(Boolean).findLast((part) => VIMEO_ID.test(part));
  return candidate ?? null;
}

export function resolveVideoPlayback(
  rawSource: string | null | undefined,
  options: ResolveVideoPlaybackOptions = {},
): VideoPlayback {
  const source = rawSource?.trim();
  if (!source) {
    return { kind: "unsupported", sourceUrl: null, embedUrl: null, provider: "unknown" };
  }

  if (source.startsWith("blob:")) {
    return options.allowLocalObjectUrl
      ? { kind: "native", sourceUrl: source, embedUrl: null, provider: "local" }
      : { kind: "unsupported", sourceUrl: null, embedUrl: null, provider: "unknown" };
  }

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return { kind: "unsupported", sourceUrl: null, embedUrl: null, provider: "unknown" };
  }

  if (url.protocol !== "https:") {
    return { kind: "unsupported", sourceUrl: null, embedUrl: null, provider: "unknown" };
  }

  const ytId = youtubeId(url);
  if (ytId) {
    return {
      kind: "youtube",
      sourceUrl: url.toString(),
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?playsinline=1&rel=0`,
      provider: "YouTube",
    };
  }

  const vmId = vimeoId(url);
  if (vmId) {
    return {
      kind: "vimeo",
      sourceUrl: url.toString(),
      embedUrl: `https://player.vimeo.com/video/${vmId}?dnt=1&playsinline=1`,
      provider: "Vimeo",
    };
  }

  const providerHint = options.providerHint?.trim().toLowerCase();
  const nativeHint = providerHint === "native" || options.mimeType?.toLowerCase().startsWith("video/");
  if (nativeHint || NATIVE_VIDEO_PATH.test(url.pathname)) {
    return { kind: "native", sourceUrl: url.toString(), embedUrl: null, provider: "Video" };
  }

  return { kind: "external", sourceUrl: url.toString(), embedUrl: null, provider: "Publisher" };
}

export function addPlaybackAutoplay(embedUrl: string, { muted = false }: { muted?: boolean } = {}): string {
  const url = new URL(embedUrl);
  url.searchParams.set("autoplay", "1");
  if (muted && url.hostname === "www.youtube-nocookie.com") url.searchParams.set("mute", "1");
  if (muted && url.hostname === "player.vimeo.com") url.searchParams.set("muted", "1");
  return url.toString();
}
