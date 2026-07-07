import { NextResponse } from "next/server";
import { operationsRegistry } from "@/lib/saasOperationsRegistry";

const defaultAgentServer =
  "https://support371-gem-enterprise.vercel.app";

function toOperation(operation: (typeof operationsRegistry)[number]) {
  return {
    tags: [operation.domain],
    operationId: `${operation.method.toLowerCase()}_${operation.path.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
    summary: operation.label,
    description: `${operation.description} Mode: ${operation.mode}. Risk: ${operation.risk}.`,
    responses: {
      "200": {
        description: "Operation response.",
      },
      "401": {
        description: "Unauthorized.",
      },
      "403": {
        description: "Forbidden.",
      },
    },
  };
}

function getServer() {
  return (
    process.env.GEM_AGENT_API_BASE_URL?.trim().replace(/\/+$/, "") ||
    defaultAgentServer
  );
}

function getPublicStorefrontSchema() {
  return {
    openapi: "3.1.0",
    info: {
      title: "GEM Storefront Access API",
      version: "1.0.0",
      description:
        "Public read-only bridge that lets the Platform Operations Agent retrieve approved GEM Google Store and TikTok Shop destinations. It exposes no database credentials, customer records, or write operations.",
    },
    servers: [
      {
        url: getServer(),
        description: "GEM Enterprise public storefront API",
      },
    ],
    paths: {
      "/api/agent/public/commerce": {
        get: {
          operationId: "getGemPublicStorefront",
          summary: "Get the approved GEM Google or TikTok storefront",
          description:
            "Return all approved storefront destinations or one focused TikTok or Google response.",
          parameters: [
            {
              name: "channel",
              in: "query",
              required: false,
              description: "Optional storefront channel.",
              schema: {
                type: "string",
                enum: ["tiktok", "google"],
              },
            },
          ],
          responses: {
            "200": {
              description: "Approved public storefront routing information.",
            },
          },
        },
      },
    },
  };
}

function getAgentSchema() {
  return {
    openapi: "3.1.0",
    info: {
      title: "GEM Platform Operations Agent API",
      version: "1.0.0",
      description:
        "Read-only authenticated bridge between the Platform Operations Agent and the GEM Enterprise backend. It returns platform, database, Google Store, and TikTok Shop status without exposing infrastructure credentials.",
    },
    servers: [
      {
        url: getServer(),
        description: "GEM Enterprise agent API",
      },
    ],
    security: [{ agentKeyAuth: [] }],
    paths: {
      "/api/agent/health": {
        get: {
          operationId: "checkGemPlatformHealth",
          summary: "Check the GEM backend and shared database",
          responses: {
            "200": { description: "Platform and database health status." },
            "401": { description: "Invalid or missing agent key." },
            "503": { description: "Agent API authentication is not configured." },
          },
        },
      },
      "/api/agent/context": {
        get: {
          operationId: "getGemPlatformContext",
          summary: "Get GEM platform or storefront context",
          description:
            "Return the complete platform context or a focused all-stores, TikTok, or Google view.",
          parameters: [
            {
              name: "view",
              in: "query",
              required: false,
              description: "Optional focused context view.",
              schema: {
                type: "string",
                enum: ["platform", "stores", "tiktok", "google"],
                default: "platform",
              },
            },
          ],
          responses: {
            "200": { description: "Requested GEM platform context." },
            "401": { description: "Invalid or missing agent key." },
            "503": { description: "Agent API authentication is not configured." },
          },
        },
      },
      "/api/agent/commerce": {
        get: {
          operationId: "getGemCommerceStatus",
          summary: "Get approved GEM storefront destinations",
          description:
            "Return all approved storefront destinations or a focused TikTok or Google response.",
          parameters: [
            {
              name: "channel",
              in: "query",
              required: false,
              description: "Optional commerce channel.",
              schema: {
                type: "string",
                enum: ["tiktok", "google"],
              },
            },
          ],
          responses: {
            "200": { description: "Approved store routing and connection status." },
            "401": { description: "Invalid or missing agent key." },
            "503": { description: "Agent API authentication is not configured." },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        agentKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-GEM-Agent-Key",
          description:
            "Private credential configured in Vercel and the Platform Operations Agent Action. The backend may reuse the existing GPT_AUTH_TOKEN.",
        },
      },
    },
  };
}

export async function GET(request: Request) {
  const profile = new URL(request.url).searchParams.get("profile");
  if (profile === "storefront") {
    return NextResponse.json(getPublicStorefrontSchema(), {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  if (profile === "agent") {
    return NextResponse.json(getAgentSchema(), {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  const paths = operationsRegistry.reduce<Record<string, Record<string, unknown>>>((acc, operation) => {
    if (operation.path.startsWith("connected:")) return acc;

    acc[operation.path] ??= {};
    acc[operation.path][operation.method.toLowerCase()] = toOperation(operation);
    return acc;
  }, {});

  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "GEM Enterprise Operations API",
      version: "1.0.0",
      description:
        "Operational API descriptor for GEM Enterprise. This descriptor maps the broader SaaS operations model to implemented, partial, planned, and external capabilities inside the platform.",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || "https://gemcybersecurityassist.com",
        description: "GEM Enterprise application server",
      },
    ],
    security: [{ cookieAuth: [] }],
    paths,
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "gem_session",
        },
      },
    },
    "x-gem-registry": {
      totalOperations: operationsRegistry.length,
      externalOperations: operationsRegistry.filter((operation) => operation.mode === "external").length,
      approvalRequiredOperations: operationsRegistry.filter((operation) => operation.risk !== "safe").length,
    },
  });
}
