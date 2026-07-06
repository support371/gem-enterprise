import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  GOOGLE_MAIN_STORE_URL,
  TIKTOK_MAIN_STORE_URL,
} from "@/lib/storefrontDestinations";

const DEFAULT_APP_ORIGIN = "https://www.gemcybersecurityassist.com";
const DEFAULT_AGENT_API_ORIGIN =
  "https://support371-gem-enterprise-git-main-admin-25521151s-projects.vercel.app";

function cleanOrigin(value: string | undefined, fallback: string) {
  return (value?.trim() || fallback).replace(/\/+$/, "");
}

export const GEM_APP_ORIGIN = cleanOrigin(
  process.env.GEM_PUBLIC_APP_URL,
  DEFAULT_APP_ORIGIN,
);

export const GEM_AGENT_API_ORIGIN = cleanOrigin(
  process.env.GEM_AGENT_API_BASE_URL,
  DEFAULT_AGENT_API_ORIGIN,
);

function constantTimeMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function suppliedAgentKey(request: Request) {
  const headerKey = request.headers.get("x-gem-agent-key")?.trim();
  if (headerKey) return headerKey;

  const authorization = request.headers.get("authorization")?.trim() || "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return "";
}

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function requireGemAgent(request: Request) {
  const expected = process.env.GEM_AGENT_API_KEY?.trim() || "";

  if (expected.length < 32) {
    return jsonNoStore(
      {
        ok: false,
        error: "agent_api_not_configured",
        message: "GEM_AGENT_API_KEY must be configured in the server environment.",
      },
      503,
    );
  }

  const supplied = suppliedAgentKey(request);
  if (!supplied || !constantTimeMatch(supplied, expected)) {
    return jsonNoStore(
      {
        ok: false,
        error: "unauthorized",
        message: "A valid GEM agent API key is required.",
      },
      401,
    );
  }

  return null;
}

function hasDatabaseRuntimeUrl() {
  return Boolean(
    process.env.POSTGRES_PRISMA_URL?.trim() ||
      process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_URL?.trim() ||
      process.env.NEON_DATABASE_URL?.trim(),
  );
}

export async function getAgentDatabaseStatus() {
  if (!hasDatabaseRuntimeUrl()) {
    return {
      status: "unavailable" as const,
      configured: false,
      diagnostic: "missing_runtime_url",
    };
  }

  try {
    await db.$queryRaw`SELECT 1`;
    return {
      status: "ok" as const,
      configured: true,
      diagnostic: "ok",
    };
  } catch {
    return {
      status: "error" as const,
      configured: true,
      diagnostic: "connection_failed",
    };
  }
}

export function getAgentStoreSummary() {
  const tiktokSellerConnected =
    process.env.TIKTOK_SELLER_ACCOUNT_CONNECTED === "true";
  const googleMerchantConnected =
    process.env.GOOGLE_MERCHANT_ACCOUNT_CONNECTED === "true";

  return {
    tiktok: {
      name: "Main TikTok Shop",
      status: "connected_storefront",
      internal_page: `${GEM_APP_ORIGIN}/store/tiktok`,
      external_storefront: TIKTOK_MAIN_STORE_URL,
      seller_account_connected: tiktokSellerConnected,
      account_forwarding_enabled: tiktokSellerConnected,
    },
    google: {
      name: "Google Store",
      status: "connected_storefront",
      internal_page: `${GEM_APP_ORIGIN}/store/google`,
      external_storefront: GOOGLE_MAIN_STORE_URL,
      merchant_account_connected: googleMerchantConnected,
    },
  };
}

export async function getAgentPlatformContext() {
  const database = await getAgentDatabaseStatus();
  const stores = getAgentStoreSummary();

  return {
    ok: true,
    status: database.status === "ok" ? "operational" : "degraded",
    timestamp: new Date().toISOString(),
    platform: {
      name: "GEM Enterprise",
      website: GEM_APP_ORIGIN,
      agent_api: GEM_AGENT_API_ORIGIN,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      commit_sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || null,
    },
    database,
    stores,
    capabilities: {
      read_store_status: true,
      read_platform_status: true,
      direct_database_credentials_exposed: false,
      write_operations_enabled: false,
      tiktok_live_publishing_enabled:
        process.env.TOKMETRIC_LIVE_PUBLISHING_ENABLED === "true",
    },
  };
}

export { jsonNoStore };
