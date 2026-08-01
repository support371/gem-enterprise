import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_HOSTS = new Set([
  "news.gemcybersecurityassist.com",
  "gemcybersecurityassist.com",
  "www.gemcybersecurityassist.com",
]);

function resolveConfiguredUrl() {
  const raw = process.env.NEXT_PUBLIC_NEWS_FORGE_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;

    const allowed =
      ALLOWED_HOSTS.has(url.hostname) ||
      url.hostname.endsWith(".vercel.app") ||
      url.hostname.endsWith(".lovable.app");

    return allowed ? url : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const configuredUrl = resolveConfiguredUrl();

  if (!configuredUrl) {
    return NextResponse.json(
      {
        service: "news-forge",
        configured: false,
        reachable: false,
        embeddedRoute: "/intel/news",
        requiredVariable: "NEXT_PUBLIC_NEWS_FORGE_URL",
        expectedProductionHost: "news.gemcybersecurityassist.com",
        checkedAt: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(configuredUrl, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": "GEM-News-Forge-Health/1.0" },
    });

    const reachable = response.ok || (response.status >= 300 && response.status < 500);

    return NextResponse.json(
      {
        service: "news-forge",
        configured: true,
        reachable,
        upstreamStatus: response.status,
        host: configuredUrl.hostname,
        embeddedRoute: "/intel/news",
        embedQuery: "embed=gem",
        checkedAt: new Date().toISOString(),
      },
      {
        status: reachable ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        service: "news-forge",
        configured: true,
        reachable: false,
        host: configuredUrl.hostname,
        embeddedRoute: "/intel/news",
        error: error instanceof Error ? error.name : "upstream_check_failed",
        checkedAt: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}
