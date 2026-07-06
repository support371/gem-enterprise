import { NextResponse } from "next/server";
import { operationsRegistry } from "@/lib/saasOperationsRegistry";

const defaultAgentServer =
  "https://support371-gem-enterprise-git-main-admin-25521151s-projects.vercel.app";

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

function getAgentSchema() {
  const server =
    process.env.GEM_AGENT_API_BASE_URL?.trim().replace(/\/+$/, "") ||
    defaultAgentServer;

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
        url: server,
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
    },
    components: {
      securitySchemes: {
        agentKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-GEM-Agent-Key",
          description: "Private API key configured in Vercel and the GPT Action.",
        },
      },
    },
  };
}

export async function GET(request: Request) {
  const profile = new URL(request.url).searchParams.get("profile");
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
