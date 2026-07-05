import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function deploymentMetadata() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || null;

  return {
    environment: process.env.VERCEL_ENV?.trim() || process.env.NODE_ENV || "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF?.trim() || null,
    commitSha: commitSha ? commitSha.slice(0, 12) : null,
    region: process.env.VERCEL_REGION?.trim() || null,
  };
}

export async function GET(_request: NextRequest) {
  let dbStatus: "ok" | "error" = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  const status = dbStatus === "ok" ? "ok" : "degraded";
  const httpStatus = dbStatus === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      deployment: deploymentMetadata(),
      services: {
        database: dbStatus,
      },
    },
    {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
