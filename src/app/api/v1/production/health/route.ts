import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    checkedAt: new Date().toISOString(),
    services: [
      { name: "application", status: "healthy" },
      { name: "api", status: "healthy" },
      { name: "operations-registry", status: "healthy" },
    ],
  });
}
