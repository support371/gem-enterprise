// Lightweight slug generator — stable across runs, URL-safe.

export function slugify(input: string, maxLen = 80): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, maxLen)
    .replace(/-+$/, "");
}

// Derives a deterministic external guid when feed item.guid is missing.
export function fallbackGuidFromUrl(url: string): string {
  // Simple djb2-ish hash so we get stable, short ids.
  let hash = 5381;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) + hash) ^ url.charCodeAt(i);
  }
  return `url_${(hash >>> 0).toString(36)}`;
}

// Produces a unique slug from a title + published date so collisions are rare.
export function buildArticleSlug(title: string, publishedAt: Date): string {
  const base = slugify(title || "article");
  const date = publishedAt.toISOString().slice(0, 10); // YYYY-MM-DD
  return `${base}-${date}`.slice(0, 120);
}
