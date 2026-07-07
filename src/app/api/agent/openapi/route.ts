import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "GEM Platform Operations API",
      version: "1.0.0",
      description: "Read-only operational bridge for the GEM Platform Operations Agent.",
    },
    servers: [{ url: "https://support371-gem-enterprise.vercel.app" }],
    security: [{ GemAgentKey: [] }],
    paths: {
      "/api/agent/health": {
        get: {
          operationId: "checkGemPlatformHealth",
          summary: "Check the GEM backend and shared database status",
          responses: {
            "200": { description: "Current platform health" },
            "401": { description: "Invalid or missing agent API key" },
            "503": { description: "Agent API or database is not configured" },
          },
        },
      },
      "/api/agent/context": {
        get: {
          operationId: "getGemPlatformContext",
          summary: "Get GEM platform, database, capabilities, and store context",
          responses: {
            "200": { description: "Current platform context" },
            "401": { description: "Invalid or missing agent API key" },
            "503": { description: "Agent API is not configured" },
          },
        },
      },
      "/api/agent/storefront": {
        get: {
          operationId: "getGemStorefront",
          summary: "Get the approved TikTok or Google storefront destination",
          parameters: [
            {
              name: "channel",
              in: "query",
              required: true,
              schema: { type: "string", enum: ["tiktok", "google"] },
            },
          ],
          responses: {
            "200": { description: "Approved storefront information" },
            "400": { description: "Unsupported channel" },
            "401": { description: "Invalid or missing agent API key" },
            "503": { description: "Agent API is not configured" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        GemAgentKey: {
          type: "apiKey",
          in: "header",
          name: "X-GEM-Agent-Key",
        },
      },
    },
  }, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
