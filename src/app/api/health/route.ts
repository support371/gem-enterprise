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

type DatabaseDiagnostic =
  | "ok"
  | "missing_runtime_url"
  | "authentication_failed"
  | "unreachable"
  | "tls_error"
  | "database_or_schema_missing"
  | "query_failed";

function classifyDatabaseFailure(error: unknown): DatabaseDiagnostic {
  if (!process.env.POSTGRES_PRISMA_URL?.trim()) return "missing_runtime_url";

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("authentication failed") || message.includes("password authentication failed")) {
    return "authentication_failed";
  }
  if (
    message.includes("can't reach database server") ||
    message.includes("cannot reach database server") ||
    message.includes("connection refused") ||
    message.includes("connection timed out") ||
    message.includes("connect econn")
  ) {
    return "unreachable";
  }
  if (message.includes("ssl") || message.includes("tls") || message.includes("certificate")) {
    return "tls_error";
  }
  if (
    message.includes("database") && message.includes("does not exist") ||
    message.includes("schema") && message.includes("does not exist")
  ) {
    return "database_or_schema_missing";
  }
  return "query_failed";
}

export async function GET(_request: NextRequest) {
  let database: DatabaseDiagnostic = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch (error) {
    database = classifyDatabaseFailure(error);
  }

  const healthy = database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      deployment: deploymentMetadata(),
      services: {
        database: healthy ? "ok" : "error",
        databaseDiagnostic: database,
      },
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
