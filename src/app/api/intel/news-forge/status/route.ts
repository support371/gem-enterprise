import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SOURCE_REPOSITORY = "support371/news-forge-feed";
const SOURCE_BRANCH = "feat/gem-platform-production-match";
const REQUIRED_ROUTES = [
  "/",
  "/story/:id",
  "/saved",
  "/preferences",
  "/auth",
  "/admin",
  "/policy",
] as const;

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

function resolveExpectedSourceCommit() {
  const value = process.env.NEWS_FORGE_EXPECTED_SOURCE_SHA?.trim().toLowerCase();
  return value && /^[0-9a-f]{40}$/.test(value) ? value : null;
}

function getFrameAncestors(contentSecurityPolicy: string | null) {
  if (!contentSecurityPolicy) return null;
  const match = contentSecurityPolicy.match(
    /(?:^|;)\s*frame-ancestors\s+([^;]+)/i,
  );
  return match?.[1]?.trim() ?? null;
}

function evaluateFramePolicy(headers: Headers) {
  const contentSecurityPolicy = headers.get("content-security-policy");
  const frameAncestors = getFrameAncestors(contentSecurityPolicy);
  const xFrameOptions = headers.get("x-frame-options");
  const normalizedXFrameOptions = xFrameOptions?.trim().toUpperCase() ?? null;

  const blockedByXFrameOptions =
    normalizedXFrameOptions === "DENY" ||
    normalizedXFrameOptions === "SAMEORIGIN";

  const explicitGemPermission = Boolean(
    frameAncestors &&
      (frameAncestors.includes("https://gemcybersecurityassist.com") ||
        frameAncestors.includes("https://*.gemcybersecurityassist.com") ||
        frameAncestors.split(/\s+/).includes("*")),
  );

  return {
    embeddable: !blockedByXFrameOptions && explicitGemPermission,
    explicitGemPermission,
    frameAncestors,
    xFrameOptions,
  };
}

function inspectManifest(
  value: unknown,
  expectedSourceCommit: string | null,
) {
  const manifest = value && typeof value === "object" ? value : null;
  const read = (key: string) =>
    manifest && key in manifest
      ? (manifest as Record<string, unknown>)[key]
      : undefined;

  const sourceRepository = read("sourceRepository");
  const sourceRef = read("sourceRef");
  const sourceCommit = read("sourceCommit");
  const embedQuery = read("embedQuery");
  const routes = read("requiredRoutes");
  const requiredRoutes = Array.isArray(routes)
    ? routes.filter((route): route is string => typeof route === "string")
    : [];

  const routeContractComplete = REQUIRED_ROUTES.every((route) =>
    requiredRoutes.includes(route),
  );
  const commitMatches = Boolean(
    expectedSourceCommit &&
      typeof sourceCommit === "string" &&
      sourceCommit.toLowerCase() === expectedSourceCommit,
  );

  return {
    sourceVerified:
      sourceRepository === SOURCE_REPOSITORY &&
      commitMatches &&
      embedQuery === "embed=gem" &&
      routeContractComplete,
    sourceRepository:
      typeof sourceRepository === "string" ? sourceRepository : null,
    sourceRef: typeof sourceRef === "string" ? sourceRef : null,
    sourceCommit: typeof sourceCommit === "string" ? sourceCommit : null,
    commitMatches,
    embedQuery: typeof embedQuery === "string" ? embedQuery : null,
    requiredRoutes,
    routeContractComplete,
  };
}

function baseContract(expectedSourceCommit: string | null) {
  return {
    service: "news-forge",
    sourceContract: {
      repository: SOURCE_REPOSITORY,
      branch: SOURCE_BRANCH,
      expectedCommit: expectedSourceCommit,
      requiredRoutes: REQUIRED_ROUTES,
      embedQuery: "embed=gem",
    },
    platform: {
      repository: "support371/gem-enterprise",
      route: "/intel/news",
      deploymentCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    },
  };
}

export async function GET() {
  const configuredUrl = resolveConfiguredUrl();
  const expectedSourceCommit = resolveExpectedSourceCommit();
  const contract = baseContract(expectedSourceCommit);

  if (!configuredUrl || !expectedSourceCommit) {
    return NextResponse.json(
      {
        ...contract,
        configured: false,
        reachable: false,
        embeddable: false,
        sourceVerified: false,
        ready: false,
        requiredVariables: [
          "NEXT_PUBLIC_NEWS_FORGE_URL",
          "NEWS_FORGE_EXPECTED_SOURCE_SHA",
        ],
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
  const timeout = setTimeout(() => controller.abort(), 8_000);
  const manifestUrl = new URL("/news-forge-manifest.json", configuredUrl);

  try {
    const [upstreamResponse, manifestResponse] = await Promise.all([
      fetch(configuredUrl, {
        method: "HEAD",
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
        headers: { "User-Agent": "GEM-News-Forge-Health/2.0" },
      }),
      fetch(manifestUrl, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
        headers: { "User-Agent": "GEM-News-Forge-Health/2.0" },
      }),
    ]);

    const reachable =
      upstreamResponse.ok ||
      (upstreamResponse.status >= 300 && upstreamResponse.status < 500);
    const framePolicy = evaluateFramePolicy(upstreamResponse.headers);

    let manifestValue: unknown = null;
    if (manifestResponse.ok) {
      try {
        manifestValue = await manifestResponse.json();
      } catch {
        manifestValue = null;
      }
    }
    const manifest = inspectManifest(manifestValue, expectedSourceCommit);
    const ready =
      reachable && framePolicy.embeddable && manifest.sourceVerified;

    return NextResponse.json(
      {
        ...contract,
        configured: true,
        reachable,
        embeddable: framePolicy.embeddable,
        sourceVerified: manifest.sourceVerified,
        ready,
        upstreamStatus: upstreamResponse.status,
        manifestStatus: manifestResponse.status,
        host: configuredUrl.hostname,
        embeddedUrl: new URL("/?embed=gem", configuredUrl).toString(),
        framePolicy,
        manifest,
        checkedAt: new Date().toISOString(),
      },
      {
        status: ready ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ...contract,
        configured: true,
        reachable: false,
        embeddable: false,
        sourceVerified: false,
        ready: false,
        host: configuredUrl.hostname,
        error:
          error instanceof Error ? error.name : "upstream_check_failed",
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
