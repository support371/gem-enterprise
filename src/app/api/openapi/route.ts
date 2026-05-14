import { NextResponse } from "next/server";
import { operationsRegistry } from "@/lib/saasOperationsRegistry";

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

export async function GET() {
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
