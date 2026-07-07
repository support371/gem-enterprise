import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const defaultServer = "https://support371-gem-enterprise.vercel.app";

function serverUrl() {
  return (
    process.env.GEM_AGENT_API_BASE_URL?.trim().replace(/\/+$/, "") ||
    defaultServer
  );
}

export async function GET() {
  return NextResponse.json(
    {
      openapi: "3.1.0",
      info: {
        title: "GEM Platform Operations Agent API",
        version: "1.0.0",
        description:
          "Read-only bridge from the Platform Operations Agent to the GEM Enterprise backend, shared database status, and approved Google and TikTok storefronts.",
      },
      servers: [{ url: serverUrl() }],
      paths: {
        "/api/agent/public/commerce": {
          get: {
            operationId: "getGemPublicStorefront",
            summary: "Get an approved public GEM storefront",
            description:
              "Returns Google and TikTok storefront routing without customer data, credentials, or write access.",
            parameters: [
              {
                name: "channel",
                in: "query",
                required: false,
                schema: {
                  type: "string",
                  enum: ["tiktok", "google"],
                },
              },
            ],
            responses: {
              "200": { description: "Approved storefront routing information." },
            },
          },
        },
        "/api/agent/health": {
          get: {
            operationId: "checkGemPlatformHealth",
            summary: "Check the GEM backend and shared database",
            security: [{ GemAgentKey: [] }],
            responses: {
              "200": { description: "Current platform and database health." },
              "401": { description: "Invalid or missing agent credential." },
              "503": { description: "Agent credential or database is not configured." },
            },
          },
        },
        "/api/agent/context": {
          get: {
            operationId: "getGemPlatformContext",
            summary: "Get platform, database, capability, and storefront context",
            security: [{ GemAgentKey: [] }],
            parameters: [
              {
                name: "view",
                in: "query",
                required: false,
                schema: {
                  type: "string",
                  enum: ["platform", "stores", "tiktok", "google"],
                  default: "platform",
                },
              },
            ],
            responses: {
              "200": { description: "Requested GEM platform context." },
              "401": { description: "Invalid or missing agent credential." },
              "503": { description: "Agent credential is not configured." },
            },
          },
        },
        "/api/agent/commerce": {
          get: {
            operationId: "getGemCommerceStatus",
            summary: "Get authenticated Google or TikTok storefront status",
            security: [{ GemAgentKey: [] }],
            parameters: [
              {
                name: "channel",
                in: "query",
                required: false,
                schema: {
                  type: "string",
                  enum: ["tiktok", "google"],
                },
              },
            ],
            responses: {
              "200": { description: "Approved storefront and account-connection status." },
              "401": { description: "Invalid or missing agent credential." },
              "503": { description: "Agent credential is not configured." },
            },
          },
        },
        "/api/agent/storefront": {
          get: {
            operationId: "getGemStorefront",
            summary: "Get one approved storefront destination",
            security: [{ GemAgentKey: [] }],
            parameters: [
              {
                name: "channel",
                in: "query",
                required: true,
                schema: {
                  type: "string",
                  enum: ["tiktok", "google"],
                },
              },
            ],
            responses: {
              "200": { description: "Approved storefront information." },
              "400": { description: "Unsupported channel." },
              "401": { description: "Invalid or missing agent credential." },
              "503": { description: "Agent credential is not configured." },
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
            description:
              "Private server-to-server credential stored in Vercel and the Platform Operations Agent Action settings.",
          },
        },
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
