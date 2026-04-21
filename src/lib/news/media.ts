// Extracts image / video metadata from a parsed RSS item so article cards
// can render rich media without an additional fetch.

import type Parser from "rss-parser";

export type MediaExtract = {
  mediaType: "none" | "image" | "video";
  imageUrl: string | null;
  imageAlt: string | null;
  videoUrl: string | null;
  videoThumbnail: string | null;
  videoProvider: string | null;
};

type RssItem = Parser.Item & {
  enclosure?: { url?: string; type?: string };
  "media:content"?: unknown;
  "media:thumbnail"?: unknown;
  content?: string;
  contentSnippet?: string;
  "content:encoded"?: string;
};

const YT_RE =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

function firstUrlFrom(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const v of value) {
      const url = firstUrlFrom(v);
      if (url) return url;
    }
    return null;
  }
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (typeof v.url === "string") return v.url;
    if (v.$ && typeof (v.$ as Record<string, unknown>).url === "string") {
      return (v.$ as Record<string, unknown>).url as string;
    }
  }
  return null;
}

function extractFirstImgFromHtml(html?: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function extractVideo(html?: string): {
  url: string;
  thumbnail: string | null;
  provider: string;
} | null {
  if (!html) return null;
  const yt = html.match(YT_RE);
  if (yt) {
    return {
      url: `https://www.youtube.com/watch?v=${yt[1]}`,
      thumbnail: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
      provider: "youtube",
    };
  }
  const vm = html.match(VIMEO_RE);
  if (vm) {
    return {
      url: `https://vimeo.com/${vm[1]}`,
      thumbnail: null,
      provider: "vimeo",
    };
  }
  return null;
}

export function extractMedia(item: RssItem, fallbackTitle: string): MediaExtract {
  const htmlBlob =
    (item["content:encoded"] as string | undefined) ??
    item.content ??
    item.contentSnippet ??
    "";

  // 1) Check for video in content
  const video = extractVideo(htmlBlob);
  if (video) {
    return {
      mediaType: "video",
      imageUrl: video.thumbnail,
      imageAlt: fallbackTitle,
      videoUrl: video.url,
      videoThumbnail: video.thumbnail,
      videoProvider: video.provider,
    };
  }

  // 2) Prefer enclosure (most RSS feeds put media here)
  const enclosureUrl = item.enclosure?.url;
  const enclosureType = item.enclosure?.type ?? "";
  if (enclosureUrl) {
    if (enclosureType.startsWith("video/")) {
      return {
        mediaType: "video",
        imageUrl: null,
        imageAlt: fallbackTitle,
        videoUrl: enclosureUrl,
        videoThumbnail: null,
        videoProvider: "native",
      };
    }
    if (enclosureType.startsWith("image/") || /\.(jpe?g|png|gif|webp|avif)/i.test(enclosureUrl)) {
      return {
        mediaType: "image",
        imageUrl: enclosureUrl,
        imageAlt: fallbackTitle,
        videoUrl: null,
        videoThumbnail: null,
        videoProvider: null,
      };
    }
  }

  // 3) media:content / media:thumbnail namespaces
  const mediaContentUrl = firstUrlFrom(item["media:content"]);
  const mediaThumbUrl = firstUrlFrom(item["media:thumbnail"]);
  const mediaUrl = mediaContentUrl ?? mediaThumbUrl;
  if (mediaUrl) {
    return {
      mediaType: "image",
      imageUrl: mediaUrl,
      imageAlt: fallbackTitle,
      videoUrl: null,
      videoThumbnail: null,
      videoProvider: null,
    };
  }

  // 4) Fallback: first <img> in the content
  const inlineImg = extractFirstImgFromHtml(htmlBlob);
  if (inlineImg) {
    return {
      mediaType: "image",
      imageUrl: inlineImg,
      imageAlt: fallbackTitle,
      videoUrl: null,
      videoThumbnail: null,
      videoProvider: null,
    };
  }

  return {
    mediaType: "none",
    imageUrl: null,
    imageAlt: null,
    videoUrl: null,
    videoThumbnail: null,
    videoProvider: null,
  };
}

// Strip HTML tags for summary storage.
export function stripHtml(html?: string | null, maxLen = 400): string | null {
  if (!html) return null;
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}
