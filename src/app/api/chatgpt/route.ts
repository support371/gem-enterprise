import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    service: "GEM Enterprise ChatGPT Bridge",
    status: "ready",
    version: "1",
    capabilities: [
      "platform_status",
      "workspace_lookup",
      "client_status",
      "operations_status",
      "support_context",
    ],
    access: "read-only-by-default",
    note: "Discovery endpoint only. Privileged GEM operations remain behind existing authentication and authorization controls.",
  });
}
