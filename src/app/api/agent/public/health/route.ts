import { getAgentPlatformContext, jsonNoStore } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getAgentPlatformContext();

  return jsonNoStore({
    ok: true,
    status: context.status,
    timestamp: context.timestamp,
    service: "gem-enterprise",
    database: {
      status: context.database.status,
      configured: context.database.configured,
      diagnostic: context.database.diagnostic,
    },
    write_operations_enabled: false,
  });
}
