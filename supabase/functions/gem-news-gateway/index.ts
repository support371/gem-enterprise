import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "https://www.gemcybersecurityassist.com", "Access-Control-Allow-Headers": "authorization, apikey, content-type" };
const categories = new Set(["crypto", "cybersecurity", "markets", "geopolitics", "policy", "real_estate", "alternatives", "general"]);
const json = (body: unknown, status = 200, cache = false) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...(cache ? { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } : {}) } });
const clean = (value = "") => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const field = (xml: string, names: string[]) => { for (const name of names) { const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i")); if (match?.[1]) return clean(match[1]); } return ""; };
const attr = (xml: string, tag: string, name: string) => clean(xml.match(new RegExp(`<${tag}[^>]*\\s${name}=["']([^"']+)["'][^>]*>`, "i"))?.[1] || "");
const canonical = (raw: string) => { try { const url = new URL(raw); url.hash = ""; for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key); return url.toString(); } catch { return raw; } };
const slugify = (value: string) => clean(value).toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 72);
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
const tagsFor = (title: string) => [...new Set(title.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 4 && !["about", "after", "their", "there", "which", "would", "could"].includes(word)))].slice(0, 8);

type Source = { id: string; name: string; feedUrl: string; category: string };
async function ingestSource(db: ReturnType<typeof createClient>, source: Source) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(source.feedUrl, { headers: { "User-Agent": "GEM-News/2.0 (+https://www.gemcybersecurityassist.com)" }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text(); const blocks = [...xml.matchAll(/<(?:item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry)>/gi)].slice(0, 25).map((match) => match[1]);
    let created = 0, skipped = 0;
    for (const block of blocks) {
      const title = field(block, ["title"]); let url = field(block, ["link"]); if (!url) url = attr(block, "link", "href"); url = canonical(url);
      if (!title || !url || !/^https?:\/\//.test(url)) { skipped++; continue; }
      const guid = await hash(url); const suffix = guid.slice(0, 8); const summary = field(block, ["description", "summary", "content:encoded", "content"]).slice(0, 700) || null;
      const rawDate = field(block, ["pubDate", "published", "updated", "dc:date"]); const date = new Date(rawDate); const publishedAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
      const enclosure = attr(block, "enclosure", "url") || attr(block, "media:content", "url"); const youtubeId = field(block, ["yt:videoId"]); const mediaType = youtubeId || /video/i.test(attr(block, "enclosure", "type")) || /youtube|youtu\.be|vimeo/i.test(enclosure) ? "video" : enclosure ? "image" : "none";
      const imageUrl = mediaType === "image" ? enclosure : attr(block, "media:thumbnail", "url") || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null); const videoUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : mediaType === "video" ? enclosure : null;
      const { error } = await db.from("news_articles").upsert({ id: `article_${guid.slice(0, 24)}`, sourceId: source.id, externalGuid: guid, externalUrl: url, slug: `${slugify(title) || "story"}-${suffix}`, title, summary, body: null, category: source.category, tags: tagsFor(title), author: field(block, ["dc:creator", "author"]) || null, mediaType, imageUrl, imageAlt: title, videoUrl, videoThumbnail: imageUrl, videoProvider: videoUrl ? new URL(videoUrl).hostname : null, status: "published", relevanceScore: Math.max(1, 100 - Math.floor((Date.now() - new Date(publishedAt).getTime()) / 3600000)), publishedAt, updatedAt: new Date().toISOString() }, { onConflict: "externalGuid", ignoreDuplicates: true });
      if (error) skipped++; else created++;
    }
    await db.from("news_sources").update({ lastFetchedAt: new Date().toISOString(), lastSuccessAt: new Date().toISOString(), lastError: null, consecutiveFailures: 0, updatedAt: new Date().toISOString() }).eq("id", source.id);
    return { source: source.name, found: blocks.length, created, skipped };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : "Feed failure";
    await db.from("news_sources").update({ lastFetchedAt: new Date().toISOString(), lastErrorAt: new Date().toISOString(), lastError: message, updatedAt: new Date().toISOString() }).eq("id", source.id);
    return { source: source.name, error: message, found: 0, created: 0, skipped: 0 };
  } finally { clearTimeout(timer); }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const input = await request.json().catch(() => ({})) as Record<string, unknown>; const action = String(input.action || "");
  if (action === "feed") {
    const limit = Math.min(Math.max(Number(input.limit) || 24, 1), 60); const category = input.category ? String(input.category) : null;
    if (category && !categories.has(category)) return json({ error: "Invalid category" }, 400);
    let query = db.from("news_articles").select("id,slug,title,summary,aiSummary,externalUrl,category,tags,author,mediaType,imageUrl,imageAlt,videoUrl,videoThumbnail,videoProvider,isFeatured,isEditorsPick,publishedAt,source:news_sources(id,name,slug,siteUrl)").eq("status", "published").order("publishedAt", { ascending: false }).order("id", { ascending: false }).limit(limit + 1);
    if (category) query = query.eq("category", category); if (input.cursor) query = query.lt("publishedAt", String(input.cursor)); if (input.mediaOnly) query = query.neq("mediaType", "none"); if (input.videoOnly) query = query.eq("mediaType", "video");
    const search = String(input.search || "").trim().slice(0, 100); if (search) query = query.or(`title.ilike.%${search.replace(/[%_,()]/g, "")}%,summary.ilike.%${search.replace(/[%_,()]/g, "")}%`);
    const { data, error } = await query; if (error) return json({ error: "Feed query failed" }, 503); const rows = data || []; const items = rows.slice(0, limit); return json({ items, nextCursor: rows.length > limit ? items.at(-1)?.publishedAt : null, count: items.length }, 200, true);
  }
  if (action === "story") {
    const slug = String(input.slug || ""); if (!/^[a-z0-9-]{3,120}$/.test(slug)) return json({ error: "Invalid story" }, 400);
    const { data, error } = await db.from("news_articles").select("slug,title,summary,aiSummary,externalUrl,category,author,imageUrl,imageAlt,videoUrl,publishedAt,source:news_sources(name,siteUrl)").eq("status", "published").eq("slug", slug).maybeSingle(); if (error || !data) return json({ error: "Not found" }, 404); return json({ item: data }, 200, true);
  }
  if (action === "status") { const { count } = await db.from("news_articles").select("id", { count: "exact", head: true }).eq("status", "published"); return json({ ok: true, service: "gem-news-gateway", published: count || 0 }); }
  if (action === "ingest") {
    const token = String(input.token || ""); if (token.length < 32) return json({ error: "Unauthorized" }, 401); const tokenHash = await hash(token); const { data: authorization } = await db.from("news_ingestion_authorizations").select("id").eq("token_hash", tokenHash).eq("is_active", true).maybeSingle(); if (!authorization) return json({ error: "Unauthorized" }, 401);
    const started = Date.now(); const { data: sources, error } = await db.from("news_sources").select("id,name,feedUrl,category").eq("isActive", true); if (error) return json({ error: "Sources unavailable" }, 503);
    const runId = crypto.randomUUID(); await db.from("news_ingestion_runs").insert({ id: runId, status: "running", triggeredBy: "supabase_cron", sourcesAttempted: sources?.length || 0 });
    const results = await Promise.all((sources || []).map((source) => ingestSource(db, source))); const failed = results.filter((item) => "error" in item).length; const created = results.reduce((total, item) => total + item.created, 0); const found = results.reduce((total, item) => total + item.found, 0); const skipped = results.reduce((total, item) => total + item.skipped, 0); const status = failed === 0 ? "success" : failed === results.length ? "failed" : "partial";
    await db.from("news_ingestion_runs").update({ status, sourcesSucceeded: results.length - failed, sourcesFailed: failed, articlesFound: found, articlesCreated: created, articlesSkipped: skipped, durationMs: Date.now() - started, completedAt: new Date().toISOString() }).eq("id", runId);
    return json({ ok: status !== "failed", runId, status, sources: results.length, created, failed });
  }
  return json({ error: "Unknown action" }, 400);
});
