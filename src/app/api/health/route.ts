import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PERFORMANCE_THRESHOLDS } from "@/lib/performance";

export async function GET(_request: NextRequest) {
  const startTime = performance.now();
  let dbStatus: "ok" | "error" = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  const responseTime = Math.round(performance.now() - startTime);
  const status = dbStatus === "ok" ? "ok" : "degraded";
  const httpStatus = dbStatus === "ok" ? 200 : 503;

  // Check if response time exceeds threshold
  const performanceStatus = responseTime <= PERFORMANCE_THRESHOLDS.API_RESPONSE ? "healthy" : "degraded";

  const response = NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      responseTime,
      performance: {
        status: performanceStatus,
        threshold: PERFORMANCE_THRESHOLDS.API_RESPONSE,
        withinThreshold: responseTime <= PERFORMANCE_THRESHOLDS.API_RESPONSE,
      },
      services: {
        database: dbStatus,
      },
    },
    { status: httpStatus }
  );

  // Set cache headers
  response.headers.set("Cache-Control", "public, max-age=30, s-maxage=60");
  response.headers.set("Server-Timing", `db;dur=${responseTime}`);

  return response;
}
